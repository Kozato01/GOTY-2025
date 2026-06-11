from abc import ABC, abstractmethod


class DuplicateVoteError(Exception):
    """Lançada quando um voter_id já possui voto registrado (1 voto por pessoa)."""


class VoteRepository(ABC):
    """Interface comum para todos os backends de dados.

    Identidade do voto = voter_id (hash anônimo do email, gerado em auth.py).
    Nenhum backend armazena email, nome real, foto ou IP — apenas:
    voter_id (chave única), nickname (exibição), timestamp e votes.
    """

    @abstractmethod
    def is_available(self) -> bool:
        """Retorna True se a conexão está disponível."""

    @abstractmethod
    def save_vote(self, voter_id: str, nickname: str, timestamp: str, votes: dict) -> dict:
        """Salva um voto. Garante 1 voto por voter_id.

        Levanta DuplicateVoteError se o voter_id já votou.
        Retorna dict com status da operação.
        """

    @abstractmethod
    def get_vote(self, voter_id: str) -> dict | None:
        """Retorna o voto de um voter_id, ou None se não existir.
        Formato: {"nickname": str, "timestamp": str, "votes": dict}
        """

    @abstractmethod
    def get_all_votes(self) -> list:
        """Retorna todos os votos.
        Formato: [{"nickname": str, "timestamp": str, "votes": dict}, ...]
        """

    @abstractmethod
    def get_results(self) -> dict:
        """Retorna agregação pronta para exibição (sem votos crus).
        Formato: {
            "totalVoters": int,
            "byCategory": {categoria: {jogo: contagem}},
        }
        """

    @abstractmethod
    def delete_vote(self, voter_id: str) -> int:
        """Deleta o voto de um voter_id. Retorna quantidade deletada (0 ou 1)."""

    @abstractmethod
    def delete_all_votes(self) -> int:
        """Deleta todos os votos. Retorna quantidade de registros deletados."""

    # ------------------------------------------------------------------ #
    # Helper compartilhado: agrega uma lista de votos em byCategory.
    # ------------------------------------------------------------------ #
    @staticmethod
    def _aggregate(votes_list: list) -> dict:
        by_category: dict[str, dict[str, int]] = {}
        for entry in votes_list:
            for categoria, jogo in (entry.get("votes") or {}).items():
                bucket = by_category.setdefault(categoria, {})
                bucket[jogo] = bucket.get(jogo, 0) + 1
        return {"totalVoters": len(votes_list), "byCategory": by_category}
