import csv
import json
import os
import logging
from .base import VoteRepository, DuplicateVoteError

logger = logging.getLogger(__name__)

HEADER = ["VoterId", "Nickname", "Timestamp", "Votes"]


class CsvRepository(VoteRepository):
    """Backend de arquivo CSV — APENAS para teste/dev (sem garantia de concorrência)."""

    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
        csv_env = os.getenv("CSV_FILE", "data/usuarios.csv")
        if not os.path.isabs(csv_env):
            self._csv_file = os.path.join(base_dir, csv_env)
        else:
            self._csv_file = csv_env
        self._ensure_exists()
        logger.info("CSV conectado! Arquivo: %s", self._csv_file)

    def _ensure_exists(self):
        os.makedirs(os.path.dirname(self._csv_file), exist_ok=True)
        if not os.path.exists(self._csv_file):
            with open(self._csv_file, "w", newline="", encoding="utf-8") as f:
                csv.writer(f).writerow(HEADER)
            logger.info("Arquivo %s criado", self._csv_file)
            return
        self._repair_header_if_needed()

    def _repair_header_if_needed(self):
        try:
            with open(self._csv_file, "r", newline="", encoding="utf-8") as f:
                reader = csv.reader(f)
                headers = next(reader, [])
                if headers == HEADER:
                    return
                data_rows = list(reader)

            logger.warning("Header CSV inesperado em %s. Recriando (dados antigos descartados).", self._csv_file)
            # Schema mudou (voter_id). Dados antigos sem voter_id são descartados.
            with open(self._csv_file, "w", newline="", encoding="utf-8") as f:
                csv.writer(f).writerow(HEADER)
        except Exception as e:
            logger.error("Erro ao verificar/corrigir header: %s", e)

    def _read_rows(self) -> list:
        if not os.path.exists(self._csv_file):
            return []
        rows = []
        with open(self._csv_file, "r", newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)  # header
            for row in reader:
                if row:
                    rows.append(row)
        return rows

    def is_available(self) -> bool:
        return True

    def _exists(self, voter_id: str) -> bool:
        return any(r and r[0] == voter_id for r in self._read_rows())

    def save_vote(self, voter_id: str, nickname: str, timestamp: str, votes: dict) -> dict:
        self._ensure_exists()
        if self._exists(voter_id):
            raise DuplicateVoteError("Este usuário já votou")
        with open(self._csv_file, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(
                [voter_id, nickname, timestamp, json.dumps(votes, ensure_ascii=False)]
            )
        logger.info("Voto salvo no CSV (nickname=%s)", nickname)
        return {"status": "success", "message": "Voto salvo com sucesso"}

    def _row_to_dict(self, row: list) -> dict:
        try:
            votes_data = json.loads(row[3])
        except (json.JSONDecodeError, TypeError, IndexError):
            votes_data = {}
        return {
            "nickname": row[1] if len(row) > 1 else "",
            "timestamp": row[2] if len(row) > 2 else "",
            "votes": votes_data,
        }

    def get_vote(self, voter_id: str) -> dict | None:
        for row in self._read_rows():
            if row and row[0] == voter_id:
                return self._row_to_dict(row)
        return None

    def get_all_votes(self) -> list:
        return [self._row_to_dict(row) for row in self._read_rows()]

    def get_results(self) -> dict:
        return self._aggregate(self.get_all_votes())

    def delete_vote(self, voter_id: str) -> int:
        rows = self._read_rows()
        kept = [r for r in rows if not (r and r[0] == voter_id)]
        deleted = len(rows) - len(kept)
        with open(self._csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEADER)
            writer.writerows(kept)
        return deleted

    def delete_all_votes(self) -> int:
        count = len(self._read_rows())
        with open(self._csv_file, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(HEADER)
        logger.info("Todos os %d votos foram apagados do CSV", count)
        return count
