#!/usr/bin/env python3
"""
Converte um script de schema do SQL Server (gerado pelo SSMS, em UTF-16)
para um SQL simplificado que o graphify entende: tabelas, colunas e chaves
estrangeiras, sem colchetes, GO, WITH CHECK, ON [PRIMARY] etc.

Uso: python3 converter_schema.py script.sql database/schema.sql
"""
import re
import sys

ORIGEM, DESTINO = sys.argv[1], sys.argv[2]

# O SSMS salva em UTF-16; se já estiver em UTF-8, também funciona
with open(ORIGEM, "rb") as f:
    bruto = f.read()
for cod in ("utf-16", "utf-8-sig", "latin-1"):
    try:
        texto = bruto.decode(cod)
        if "CREATE TABLE" in texto.upper():
            break
    except UnicodeError:
        continue
texto = texto.replace("\r", "")

re_tabela = re.compile(r"CREATE TABLE \[(\w+)\]\.\[(\w+)\]\((.*?)\n\)\s*ON", re.S | re.I)
re_coluna = re.compile(r"^\s*\[(\w+)\]\s+\[(\w+)\](\(\s*[\w,\s]+\))?", re.M)
re_pk = re.compile(r"PRIMARY KEY\s+(?:NON)?CLUSTERED\s*\((.*?)\)", re.S | re.I)
re_fk = re.compile(
    r"ALTER TABLE \[(\w+)\]\.\[(\w+)\]\s+WITH\s+(?:NO)?CHECK\s+ADD\s+CONSTRAINT\s+\[(\w+)\]\s+"
    r"FOREIGN KEY\s*\(([^)]*)\)\s*REFERENCES\s+\[(\w+)\]\.\[(\w+)\]\s*\(([^)]*)\)",
    re.S | re.I,
)

def nomes(lista):
    return ", ".join(re.findall(r"\[(\w+)\]", lista))

saida = ["-- Schema simplificado para o graphify (gerado por converter_schema.py)\n"]
n_tab = n_fk = 0

for esquema, tabela, corpo in re_tabela.findall(texto):
    linhas = []
    for col, tipo, tam in re_coluna.findall(corpo):
        linhas.append(f"    {col} {tipo}{tam.replace(' ', '')}")
    pk = re_pk.search(corpo)
    if pk:
        linhas.append(f"    PRIMARY KEY ({nomes(pk.group(1))})")
    saida.append(f"CREATE TABLE {esquema}.{tabela} (\n" + ",\n".join(linhas) + "\n);\n")
    n_tab += 1

for esq, tab, nome, cols, esq_ref, tab_ref, cols_ref in re_fk.findall(texto):
    saida.append(
        f"ALTER TABLE {esq}.{tab} ADD CONSTRAINT {nome} "
        f"FOREIGN KEY ({nomes(cols)}) REFERENCES {esq_ref}.{tab_ref} ({nomes(cols_ref)});\n"
    )
    n_fk += 1

with open(DESTINO, "w", encoding="utf-8") as f:
    f.write("\n".join(saida))

print(f"{n_tab} tabelas e {n_fk} chaves estrangeiras gravadas em {DESTINO}")
