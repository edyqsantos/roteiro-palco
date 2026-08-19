# Roteiro de Palco

App pessoal para locução de palco, com PWA/offline para uso no iPhone.

Depois de publicar em HTTPS, abra o link no Safari do iPhone, espere aparecer "OFFLINE PRONTO" e use "Adicionar à Tela de Início".

Para Railway, defina as variáveis:

- `APP_USER`: usuário de acesso
- `APP_PASSWORD`: senha de acesso
- `DATABASE_URL`: banco Postgres do Railway para sincronização na nuvem
- `SYNC_TOKEN`: código simples exigido no app para enviar/buscar roteiros na nuvem

O app não pede PIN local. Para desfazer mudanças feitas durante o evento, use "Transferir roteiro" > "Salvar ponto" antes de começar e "Restaurar ponto" quando precisar voltar.

Também é possível manter vários roteiros no mesmo evento, por exemplo "Antes do 1º Show", "Antes do 2º Show" e "Encerramento".
