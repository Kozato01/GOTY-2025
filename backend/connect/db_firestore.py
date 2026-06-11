import os
import logging
from .base import VoteRepository, DuplicateVoteError

logger = logging.getLogger(__name__)

FIRESTORE_DB_NAME = "firestore-goty2"
VOTES_COLLECTION = "votes"


class FirestoreRepository(VoteRepository):
    def __init__(self):
        self._db = None
        try:
            self._db = self._connect()
            logger.info("Firestore conectado! Database: %s", FIRESTORE_DB_NAME)
        except Exception as e:
            logger.warning("Firestore não disponível: %s", e)

    def _connect(self):
        is_cloud_run = os.getenv("K_SERVICE") is not None

        if is_cloud_run:
            from google.cloud import firestore
            return firestore.Client(database=FIRESTORE_DB_NAME)

        service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not service_account_path:
            service_account_path = os.path.join(
                os.path.dirname(__file__), "..", "credentials", "firestore-key.json"
            )

        if os.path.exists(service_account_path):
            from google.cloud import firestore
            return firestore.Client.from_service_account_json(
                service_account_path, database=FIRESTORE_DB_NAME
            )

        raise FileNotFoundError(
            f"Service account não encontrado em: {service_account_path}"
        )

    def is_available(self) -> bool:
        return self._db is not None

    def save_vote(self, voter_id: str, nickname: str, timestamp: str, votes: dict) -> dict:
        if not self.is_available():
            raise RuntimeError("Firestore não está disponível")

        doc_ref = self._db.collection(VOTES_COLLECTION).document(voter_id)
        vote_doc = {"nickname": nickname, "timestamp": timestamp, "votes": votes}
        try:
            # create() falha se o documento já existir → unicidade atômica
            doc_ref.create(vote_doc)
        except Exception as e:
            from google.api_core import exceptions as gexc
            if isinstance(e, gexc.AlreadyExists):
                raise DuplicateVoteError("Este usuário já votou")
            raise

        logger.info("Voto salvo no Firestore (nickname=%s)", nickname)
        return {"status": "success", "message": "Voto salvo com sucesso"}

    def get_vote(self, voter_id: str) -> dict | None:
        if not self.is_available():
            return None
        snap = self._db.collection(VOTES_COLLECTION).document(voter_id).get()
        if not snap.exists:
            return None
        data = snap.to_dict()
        return {
            "nickname": data.get("nickname", ""),
            "timestamp": data.get("timestamp", ""),
            "votes": data.get("votes", {}),
        }

    def get_all_votes(self) -> list:
        if not self.is_available():
            return []

        votes_list = []
        try:
            for doc in self._db.collection(VOTES_COLLECTION).stream():
                data = doc.to_dict()
                votes_list.append({
                    "nickname": data.get("nickname", ""),
                    "timestamp": data.get("timestamp", ""),
                    "votes": data.get("votes", {}),
                })
        except Exception as e:
            logger.error("Erro ao buscar votos do Firestore: %s", e)

        return votes_list

    def get_results(self) -> dict:
        return self._aggregate(self.get_all_votes())

    def delete_vote(self, voter_id: str) -> int:
        if not self.is_available():
            raise RuntimeError("Firestore não está disponível")
        doc_ref = self._db.collection(VOTES_COLLECTION).document(voter_id)
        if not doc_ref.get().exists:
            return 0
        doc_ref.delete()
        return 1

    def delete_all_votes(self) -> int:
        if not self.is_available():
            raise RuntimeError("Firestore não está disponível")
        deleted = 0
        for doc in self._db.collection(VOTES_COLLECTION).stream():
            doc.reference.delete()
            deleted += 1
        logger.info("Todos os %d votos foram apagados do Firestore", deleted)
        return deleted
