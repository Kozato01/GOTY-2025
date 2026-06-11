import json
import os
import logging
from urllib.parse import quote_plus
from .base import VoteRepository, DuplicateVoteError

logger = logging.getLogger(__name__)

SCHEMA = "kozato"
TABLE = f"{SCHEMA}.votes"


class PostgresRepository(VoteRepository):
    def __init__(self):
        self._engine = None
        try:
            self._engine = self._connect()
            self._ensure_schema_and_table()
            logger.info("Postgres conectado! Schema: %s", SCHEMA)
        except Exception as e:
            logger.warning("Postgres não disponível: %s", e)

    def _connect(self):
        from sqlalchemy import create_engine, text

        user = os.environ["PG_USER"]
        password = quote_plus(os.environ["PG_PASSWORD"])
        host = os.environ["PG_HOST"]
        port = os.environ["PG_PORT"]
        db = os.environ["PG_DATABASE"]

        engine = create_engine(
            f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}",
            pool_pre_ping=True,
        )
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine

    def _ensure_schema_and_table(self):
        from sqlalchemy import text
        with self._engine.begin() as conn:
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA}"))
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS {TABLE} (
                    voter_id  TEXT PRIMARY KEY,
                    nickname  TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    votes     JSONB NOT NULL DEFAULT '{{}}'
                )
            """))
            conn.execute(text(
                f"CREATE INDEX IF NOT EXISTS idx_votes_gin ON {TABLE} USING GIN (votes)"
            ))
        logger.info("Tabela %s verificada/criada", TABLE)

    def is_available(self) -> bool:
        return self._engine is not None

    def save_vote(self, voter_id: str, nickname: str, timestamp: str, votes: dict) -> dict:
        if not self.is_available():
            raise RuntimeError("Postgres não está disponível")

        from sqlalchemy import text
        with self._engine.begin() as conn:
            result = conn.execute(
                text(
                    f"INSERT INTO {TABLE} (voter_id, nickname, timestamp, votes) "
                    f"VALUES (:vid, :n, :t, CAST(:v AS JSONB)) "
                    f"ON CONFLICT (voter_id) DO NOTHING"
                ),
                {"vid": voter_id, "n": nickname, "t": timestamp, "v": json.dumps(votes)},
            )
            if result.rowcount == 0:
                raise DuplicateVoteError("Este usuário já votou")

        logger.info("Voto salvo no Postgres (nickname=%s)", nickname)
        return {"status": "success", "message": "Voto salvo com sucesso"}

    def get_vote(self, voter_id: str) -> dict | None:
        if not self.is_available():
            return None
        from sqlalchemy import text
        with self._engine.connect() as conn:
            row = conn.execute(
                text(f"SELECT nickname, timestamp, votes FROM {TABLE} WHERE voter_id = :vid"),
                {"vid": voter_id},
            ).fetchone()
        if not row:
            return None
        return {
            "nickname": row[0],
            "timestamp": row[1],
            "votes": row[2] if isinstance(row[2], dict) else json.loads(row[2]),
        }

    def get_all_votes(self) -> list:
        if not self.is_available():
            return []
        from sqlalchemy import text
        try:
            with self._engine.connect() as conn:
                rows = conn.execute(
                    text(f"SELECT nickname, timestamp, votes FROM {TABLE} ORDER BY timestamp")
                ).fetchall()
            return [
                {
                    "nickname": row[0],
                    "timestamp": row[1],
                    "votes": row[2] if isinstance(row[2], dict) else json.loads(row[2]),
                }
                for row in rows
            ]
        except Exception as e:
            logger.error("Erro ao buscar votos do Postgres: %s", e)
            return []

    def get_results(self) -> dict:
        if not self.is_available():
            return {"totalVoters": 0, "byCategory": {}}
        from sqlalchemy import text
        try:
            with self._engine.connect() as conn:
                total = conn.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).scalar() or 0
                rows = conn.execute(text(
                    f"SELECT kv.key AS categoria, kv.value AS jogo, COUNT(*) AS votos "
                    f"FROM {TABLE}, jsonb_each_text(votes) AS kv "
                    f"GROUP BY kv.key, kv.value"
                )).fetchall()
            by_category: dict[str, dict[str, int]] = {}
            for categoria, jogo, votos in rows:
                by_category.setdefault(categoria, {})[jogo] = int(votos)
            return {"totalVoters": int(total), "byCategory": by_category}
        except Exception as e:
            logger.error("Erro ao agregar resultados do Postgres: %s", e)
            return self._aggregate(self.get_all_votes())

    def delete_vote(self, voter_id: str) -> int:
        if not self.is_available():
            raise RuntimeError("Postgres não está disponível")
        from sqlalchemy import text
        with self._engine.begin() as conn:
            result = conn.execute(
                text(f"DELETE FROM {TABLE} WHERE voter_id = :vid"),
                {"vid": voter_id},
            )
        return result.rowcount

    def delete_all_votes(self) -> int:
        if not self.is_available():
            raise RuntimeError("Postgres não está disponível")
        from sqlalchemy import text
        with self._engine.begin() as conn:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).scalar()
            conn.execute(text(f"DELETE FROM {TABLE}"))
        logger.info("Todos os %s votos foram apagados do Postgres", count)
        return count
