import os
from .base import VoteRepository


def get_repository() -> VoteRepository:
    """
    Factory que retorna o repositório de votos conforme DB_BACKEND no .env.
    Valores aceitos: firestore | csv | postgres
    """
    backend = os.getenv("DB_BACKEND", "firestore").lower()

    if backend == "firestore":
        from .db_firestore import FirestoreRepository
        return FirestoreRepository()

    elif backend == "csv":
        from .db_csv import CsvRepository
        return CsvRepository()

    elif backend == "postgres":
        from .db_postgres import PostgresRepository
        return PostgresRepository()

    else:
        raise ValueError(
            f"DB_BACKEND desconhecido: '{backend}'. Use: firestore | csv | postgres"
        )
