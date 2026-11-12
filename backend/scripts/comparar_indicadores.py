#!/usr/bin/env python3
"""Compara o /api/Indicadores/ entre dois servidores (ex.: dev vs branch refatorado).

Suba a dev numa porta e o branch novo em outra, apontando para o MESMO banco:

    python scripts/comparar_indicadores.py \
        --base http://127.0.0.1:8001 --novo http://127.0.0.1:8002 \
        --periodo 2026-11-01:2026-11-30 --periodo 2026-10-01:2026-10-31

O script pede usuário e senha (repita para cada perfil; Enter vazio encerra),
busca o mesmo período nos dois servidores no mesmo instante e compara o JSON
campo a campo, listando o caminho exato de cada diferença. Só usa a biblioteca
padrão e não grava nada.
"""
import argparse
import getpass
import json
import sys
import urllib.request


def http_json(url, method="GET", data=None, token=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    body = json.dumps(data).encode() if data is not None else None
    with urllib.request.urlopen(req, body, timeout=180) as r:
        return json.loads(r.read().decode())


def login(base, user, pwd):
    return http_json(f"{base}/api/token/", "POST",
                     {"username": user, "password": pwd})["access"]


def diff(a, b, path="", out=None, limite=40):
    if out is None:
        out = []
    if len(out) >= limite:
        return out
    if type(a) is not type(b):
        out.append(f"{path}: tipos diferentes ({type(a).__name__} vs {type(b).__name__})")
    elif isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                out.append(f"{path}.{k}: só no NOVO")
            elif k not in b:
                out.append(f"{path}.{k}: só na BASE")
            else:
                diff(a[k], b[k], f"{path}.{k}", out, limite)
    elif isinstance(a, list):
        if len(a) != len(b):
            out.append(f"{path}: tamanhos diferentes ({len(a)} vs {len(b)})")
        for i, (x, y) in enumerate(zip(a, b)):
            diff(x, y, f"{path}[{i}]", out, limite)
    elif a != b:
        out.append(f"{path}: {a!r} != {b!r}")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True, help="servidor de referência (dev)")
    ap.add_argument("--novo", required=True, help="servidor com a refatoração")
    ap.add_argument("--periodo", action="append", required=True,
                    help="de:ate, ex. 2026-10-01:2026-10-31 (repita para vários)")
    args = ap.parse_args()

    periodos = [p.split(":") for p in args.periodo]
    falhas = 0
    while True:
        try:
            user = input("\nUsuário (vazio para terminar): ").strip()
        except EOFError:
            break
        if not user:
            break
        pwd = getpass.getpass(f"Senha de {user}: ")
        try:
            tok_base = login(args.base, user, pwd)
            tok_novo = login(args.novo, user, pwd)
        except Exception as e:
            print(f"  login falhou: {e}")
            continue
        for de, ate in periodos:
            url = f"/api/Indicadores/?de={de}&ate={ate}"
            try:
                ja = http_json(args.base + url, token=tok_base)
                jb = http_json(args.novo + url, token=tok_novo)
            except Exception as e:
                print(f"  [{user} {de}..{ate}] ERRO na chamada: {e}")
                falhas += 1
                continue
            d = diff(ja, jb)
            if d:
                falhas += 1
                print(f"  [{user} {de}..{ate}] {len(d)}+ diferenças:")
                for linha in d:
                    print(f"    {linha}")
            else:
                print(f"  [{user} {de}..{ate}] OK — respostas idênticas")
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
