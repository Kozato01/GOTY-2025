"""Teste de contrato compartilhado dos backends de dados (Fase 2.2).

Roda a MESMA suíte nos 3 backends (csv / firestore / postgres) garantindo que
trocar o DB_BACKEND não quebra nada. Backends sem credencial/conexão no
ambiente de teste são automaticamente pulados (skip).

Rodar:  cd backend && python -m pytest tests/ -v
"""
import os
import sys
import uuid

import pytest

# Permite importar `connect` rodando de backend/ ou da raiz do repo.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from connect.base import DuplicateVoteError, VoteRepository  # noqa: E402

VOTES_A = {"Jogo do Ano": "Hades 2", "Melhor Trilha": "Silksong"}
VOTES_B = {"Jogo do Ano": "Silksong"}


def _make_csv(tmp_path):
    os.environ["CSV_FILE"] = str(tmp_path / f"votes_{uuid.uuid4().hex}.csv")
    from connect.db_csv import CsvRepository

    return CsvRepository()


def _make_firestore(_tmp_path):
    from connect.db_firestore import FirestoreRepository

    return FirestoreRepository()


def _make_postgres(_tmp_path):
    from connect.db_postgres import PostgresRepository

    return PostgresRepository()


FACTORIES = {
    "csv": _make_csv,
    "firestore": _make_firestore,
    "postgres": _make_postgres,
}


@pytest.fixture(params=list(FACTORIES))
def repo(request, tmp_path):
    """Instancia cada backend; pula se indisponível; limpa os votos de teste."""
    try:
        instance: VoteRepository = FACTORIES[request.param](tmp_path)
    except Exception as e:
        pytest.skip(f"{request.param} indisponível: {e}")
    if not instance.is_available():
        pytest.skip(f"{request.param} não disponível neste ambiente")

    created: list[str] = []
    instance._test_created = created  # rastreia voter_ids p/ cleanup
    yield instance
    for vid in created:
        try:
            instance.delete_vote(vid)
        except Exception:
            pass


def _save(repo, nickname="Tester", votes=VOTES_A):
    vid = f"test-{uuid.uuid4().hex}"
    repo._test_created.append(vid)
    repo.save_vote(vid, nickname, "2026-06-10T12:00:00", votes)
    return vid


def test_save_and_get_vote(repo):
    vid = _save(repo, nickname="Zé", votes=VOTES_A)
    vote = repo.get_vote(vid)
    assert vote is not None
    assert vote["nickname"] == "Zé"
    assert vote["votes"] == VOTES_A
    assert "timestamp" in vote


def test_get_vote_missing_returns_none(repo):
    assert repo.get_vote("test-inexistente") is None


def test_duplicate_vote_raises(repo):
    vid = _save(repo)
    with pytest.raises(DuplicateVoteError):
        repo.save_vote(vid, "Outro", "2026-06-10T13:00:00", VOTES_B)
    # O voto original permanece intacto
    assert repo.get_vote(vid)["votes"] == VOTES_A


def test_get_all_votes_has_no_identifiers(repo):
    _save(repo, nickname="Ana")
    all_votes = repo.get_all_votes()
    assert any(v["nickname"] == "Ana" for v in all_votes)
    # LGPD: nenhum identificador pessoal nos votos listados
    for v in all_votes:
        assert set(v.keys()) <= {"nickname", "timestamp", "votes"}


def test_get_results_aggregates(repo):
    _save(repo, nickname="P1", votes=VOTES_A)
    _save(repo, nickname="P2", votes=VOTES_B)
    results = repo.get_results()
    assert results["totalVoters"] >= 2
    goty = results["byCategory"]["Jogo do Ano"]
    assert goty.get("Hades 2", 0) >= 1
    assert goty.get("Silksong", 0) >= 1


def test_delete_vote(repo):
    vid = _save(repo)
    assert repo.delete_vote(vid) == 1
    assert repo.get_vote(vid) is None
    assert repo.delete_vote(vid) == 0
