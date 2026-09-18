# Roteiro de Palco

App pessoal para locução de palco, com PWA/offline para uso no iPhone.

## Estrutura

- Cada roteiro possui uma biblioteca de notas e suas playlists.
- A nota guarda nome, conteúdo e modo de apresentação: texto, patrocinadores ou tabela.
- A playlist guarda apenas a ordem das notas e pode repetir a mesma nota.
- A apresentação sempre abre uma playlist e navega por setas ou gesto lateral.
- O estado principal fica no aparelho e pode ser sincronizado com a nuvem.
- Links individuais permitem que clientes enviem recados urgentes; com internet, o painel verifica novas mensagens a cada poucos segundos.

Depois de publicar em HTTPS, abra o link no Safari do iPhone, espere aparecer "OFFLINE PRONTO" e use "Adicionar à Tela de Início".

Para Railway, defina as variáveis:

- `APP_USER`: usuário de acesso
- `APP_PASSWORD`: senha de acesso
- `DATABASE_URL`: banco Postgres do Railway para sincronização na nuvem
- `SYNC_TOKEN`: código simples exigido no app para enviar/buscar roteiros na nuvem

O app não pede PIN local. Para desfazer mudanças feitas durante o evento, use "Transferir roteiro" > "Salvar ponto" antes de começar e "Restaurar ponto" quando precisar voltar.

Também é possível manter vários roteiros no mesmo evento, por exemplo "Antes do 1º Show", "Antes do 2º Show" e "Encerramento".
