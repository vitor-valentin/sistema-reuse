### LEIA-ME

Antes de perguntar qualquer coisa leia todas as instruções abaixo, se no final tiver qualquer dúvida só mandar mensagem!

# Estrutura de Arquivos

Pra garantir um código mais limpo e evitar muitos conflitos quando formos dar merge em outras branches eu escolhi a seguinte estrutura de arquivos.

-   public / (Pasta dos arquivos que são servidos e acessíveis ao navegador, paǵinas html, código css, imagens principais, etc)
    -   fonts / (Onde ficam os arquivos de fontes, eu já fiz upload das que usamos no figma, você pode ver os nomes e variações de font-weight no /public/styles/styles.input.css)
    -   images / (Imagens que vão ser usadas no site obviamente)
    -   pages / (Todas as páginas HTML do site, não estamos usando index nesse caso já que temos as rotas pra servir cada página individualmente)
    -   components / (Ainda não criei essa pasta porque ainda não comecei no dashboard, mas basicamente são arquivos HTML de componentes de página que aparecem repetidamente, então o header/footer ou qualquer outra parte do site que apareça em diversas páginas fica aqui pra evitar ficar repetindo código html, depois você só integra ele usando JavaScript, qualquer dúvida de como fazer só pedir ou pesquisar no google/gpt o que achar melhor)
    -   scripts / (Os arquivos javascript do site)
    -   styles / (ATENÇÃO!! Usando tailwind não vai ter muito estilo para criar ou modificar mas se precisar você sempre vai mudar SOMENTE o styles.input.css o styles.output.css é o arquivo que o tailwind gera o css automático dele e ele importa todos os estilos que criamos no styles.input.css)
-   src / (Pasta dos arquivos principais do servidor e que não podem ser acessados pelo navegador)
    -   server.js (Arquivo que faz o servidor começar a rodar em alguma porta definida no ENV, você provavelmente não vai ter motivo algum pra mexer nele já que essa é exclusivamente a única função dele)
    -   app.js (O arquivo "mãe" do servidor, por ele você vai passar todas as rotas, já tem um exemplo da minha rota de login se quiser dar uma olhada)
    -   config / (Pasta para arquivos de configuração geral, então a configuração do MySQL e dos ENV ou qualquer outra sistema mais geral que você for usar você pode criar um arquivo nessa pasta, configura-lo e depois chamar no resto do código sem ter que repetir essa configuração VÁRIAS e VÁRIAS vezes)
    -   utils / (Arquivos "úteis", geralmente alguma função que você vai usar várias vezes durante o código)
    -   routes / (Arquivos das rotas, como você deve ter percebido a configuração nas rotas não fica no app.js, essa pasta serve para configurar essas rotas, porem SOMENTE o básico, você vai perceber que aqui eu só falo /login -> executar função tal que eu importei do controllers)
    -   controllers / (Literalmente "controladores", aqui é o coração da rota, então aqui você recebe a requisição e responde o cliente, basicamente as regras de negócio ficam aqui, porém você nunca vai manipular o banco de dados diretamente aqui)
    -   models / (Agora sim, os arquivos para manipulação do banco de dados, você vai ter um para cada tabela no banco, você coloca todas as funções que você precisaria que manipula tal tabela, como INSERTs, SELECTs, DELETEs)
    -   middlewares / (Como o nome diz são funções que agem no meio de requisições, se você olhar a minha rota de login vai perceber que eu tenho uma função assim: route.get("/", **notAuth**, loginController.getPage), esse notAuth é um middleware para checar se o usuário não está logado ainda, você provavelmente só vai usar os que eu já criar, auth (Verificar se está logado) e o notAuth, não consigo pensar em algum outro caso, mas se precisar e nessa pasta que você vai criar ele )
    -   validators / (Bom, eu ainda não usei essa pasta então ela não foi criada mas ela basicamente serve pra validar/formatar os dados recebidos do cliente, então você recebe uma requisição no req.body e usando um validator você formata ela como quiser e aproveita para fazer validações dos tipos de dados recebidos, etc)
-   .gitignore (Um arquivo EXTREMAMENTE importante e você não vai precisar mexer nele em nenhum momento, se você abrir ele vai ver que só tem duas linhas: .env e node_modules/, ele basicamente diz pro git ignorar pastas ou arquivos na hora de commitar e não envia eles ao github, VOCÊ NUNCA VAI DAR COMMIT EM QUALQUER UM DELES, o .env por questões de segurança mesmo que por enquanto nao estejamos usando tokens privados ou informações que não podem ser vistas futuramente podemos usar e eles nunca devem ser expostos, o node_modules/ não é necessário já que ele é criado quando você executa `npm install`)
-   .env.example (Um arquivo de exemplo do .env, ele nunca vai conter nenhuma informação, somente as variáveis do .env utilizadas, você só precisa duplicar ele, mudar o nome de um pra .env e colocar os dados que você precisar pra rodar o servidor, como a porta em que ele vai escutar e informações de login do seu banco de dados, se em algum momento você adicionar mais alguma variável você deve adicionar ela a esse arquivo, inclusive você também deve adicionar ela no /src/config/env.js, use as variáveis já importadas lá como exemplo, qualquer dúvida nas variáveis que eu já criei só mandar no zap)
-   LICENSE (Arquivo de licença do nosso projeto, só ignora)
-   README.md (Obviamente o arquivo que você tá lendo agora)
-   db.sql (O código para criar o banco de dados, eu já te enviei ele separado mas se quiser dar um olhada de novo tá aí)
-   package-lock.json e package.json (Só os arquivos do node, eles são necessários pro `npm install` instalar todos os pacotes certinho)

# TailwindCSS e execução do site

Eu já instalei e configurei o tailwind no nosso projeto então não precisa se preocupar, não sei se teve tempo de ver alguns vídeos sobre a ferramenta mas eu recomendo se ainda não tiver, ela é bem simples mas tem bastante funcionalidades e pode ser confusa no começo, no /public/pages/login.html você consegue ver um pouquinho de como eu tou usando ela, mas não é nada impossível nem muito complicado não
Agora pra executar o site você não vai precisar ficar rodando nodemon ou qualquer outra coisa, mas você vai precisar dele instalado, caso tenha esquecido o comando: `npm install -g nodemon --save-dev nodemon`.
Assim que instalar, para rodar o projeto é só usar o comando: `npm run dev:all`, ele vai rodar o TailwindCSS e o nodemon ao mesmo tempo, caso queira rodar só o Tailwind por algum motivo é: `npm run tailwind` ou só o site sem o Tailwind: `npm run dev` e por último caso não queira usar o nodemon somente o node: `npm run start`
Eu já expliquei acima sobre a estilização do Tailwind mas vale ressaltar, todo estilo que você precisar criar separadamente deve ir no **/public/styles/styles.input.css**, você nunca vai mexer no **styles.output.css** ele é a estilização automática do tailwind, e eu não acho que ele vá quebrar caso você mexa mas não tem nenhum motivo realmente pra tocar nele

# Commits e Branches

Honestamente isso são mais recomendações e estou aberto a qualquer ideia pra nomenclaturas de branches ou commits, mas eu uso o mais padrão possível pra ficar fácil a compreensão.

-   Branches: Se você ainda está na `main` vai perceber que não existe a pasta `/public` já que eu ainda não tinha criado ela quando eu estava estruturando o projeto inicialmente, você tem que ir nas branches e ir em `dev` ou no `features/login`, vou explicar mais abaixo exatamente pra que cada uma serve e algumas ideias pra nomenclaturas e normas gerais, lembre-se são só dicas/ideias como você decide nomear branches ou descrever commits é completamente por sua conta, desde que seja algo compreensível você pode decidir como vai ficar melhor pra você

-   `main`: Branch principal, obviamente você nunca vai commitar diretamente aqui em nenhum caso possível e nem dar merge direto nela, assim que terminarmos a versão "mínima" do nosso projeto vamos dar um merge pra ela e deixar salvo aqui, depois disso qualquer alteração nunca vai sair do `dev`
-   `dev`: Branch subprincipal, você também nunca vai dar commit aqui nem modificar seu código manualmente, é aqui onde você vai dar merge das suas outras branches, lembra que antes de dar merge verifica se o git te avisou sobre qualquer conflito entre o código da sua branch e da `dev`, eu acho difícil que vá acontecer já que estamos usando diversos arquivos diferentes e como cada um tem sua parte do projeto bem definida é algo raro mas que pode sim acontecer, caso aconteça resolva qualquer conflito, se tiver dificuldades sempre pode me mandar uma mensagem ou pesquisar no google/gpt
-   `Outras branches`: Qualquer parte do projeto que você for adicionar deve ficar separado em branches distinta, não pelo dia que você está adicionando aquela função mas realmente por funcionalidade, as nomenclaturas delas podem variar mas eu sigo essa tabelinha pra facilitar minha vida:

    -   `feature/(funcionalidade)`: Branches de features são funcionalidades específicas, de exemplo serve a branch que eu já criei chamada: `feature/login`, é fácil de saber o que é e qual parte do sistema estou adicionando, qualquer código relacionando aquela parte eu commito nela e SOMENTE quando eu finalizar completamente aquela função e ter certeza de que esteja tudo funcionando eu vou dar merge no `dev`
    -   `fix/(erro)`: Branches para correções de erros, com certeza isso algum erro sempre vai acabar passando ao adicionar uma parte do sistema, ou quando integrarmos elas entre si podem aparecer bugs ou erros, para concertar esses erros usamos branches com o nome `fix/(descrição curta de 1 a 4 palavras do erro)`, você também pode usar `hotfix/(erro)` geralmente essa nomenclatura é utilizada para erros mais graves e urgentes, não acho que teremos um caso assim mas sempre é bom mencionar
    -   `refactor/(funcionalidade)`: Vai chegar alguma hora onde você vai querer ou vai precisar mudar alguma coisa em uma função que já foi adicionada ao sistema, não necessariamente porque ela está errada mas por que teve alguma coisa que você deixou passar ou alguma função nova na api, seja o que for use o `refactor` para essas mudanças, você nunca vai voltar a branche que você criou a função, você vai deixar aquela branche sem mexer, é um jeito bom de manter a ordem e saber caso aquela mudança tenha quebrado algo você sabe exatamente o que foi. Geralmente refactors não alteram o comportamente do código somente alteram a forma como ele é escrito.
    -   `Resto`: Bom, acho difícil que você vá sair dessas 3 já que não é um projeto enorme, mas caso saia fica a seu critério como deseja nomear, é bom seguir um padrão como usar uma só palavra e que esteja em inglês, mas novamente, é completamente sua decisão

-   Commits: As mensagens e descrições de commits podem ser complicadas de descrever, principalmente quando você adicionou muita coisa, por isso sempre prefira commitar de vez em quando, assim além de salvar de pouco em pouco o seu código para evitar perde-lo você também não vai ter tanta dificuldade de descrever o que ele faz, eu também uso um padrão pros meus commits e você pode usar ele como base ou se inspirar nele e criar o seu, o principal é que as mensagens sejam curtas e fáceis de entender:

-   O modelo se baseia em: `tipo: descrição curta` você também pode após isso dar enter duas vezes para dar uma linha de espaço e descrever melhor o commit, um exemplo meu de commit:
```
feat: add login page and authentication system

-   add /login route and HTML page
-   implement /login/api/credentials endpoint
-   add JWT token generation utility
-   add auth middleware
-   implement token-based authentication with jsonwebtoken
```
-   Eu geralmente gosto dos meus commits todos em inglês mas aí fica a seu critério também, os tipos de commit base que eu uso: `feat`(Para funcionalidade), `fix`(Correção de bug), `refactor`(Mudança interna sem alterar comportamento), `style` (Mudanças de formatação, geralmente só uso essa se eu realmente mudei SOMENTE o estilo, caso eu tenha feito mais algo eu uso o `feat` mesmo), `docs` (Documentação), `perf` (Melhorias de performance).
-   Eu sei que tá ficando chato eu repetir, mas novamente, isso é SOMENTE UMA BASE, é um guia pra ficar organizado e como eu gosto de fazer, você pode usar o seu próprio ou pesquisar outros modelos.

-   Isso aqui é uma recomendação importante até, pode acontecer de enquanto você estiver criando uma função eu ter dado um merge em uma função que criei no `dev`, se você tentar dar merge depois, ou vai ter muitos conflitos ou pode acabar sobreescrevendo código meu, pra evitar isso sempre antes de começar a programar você roda: `git pull origin dev --rebase`, em alguns casos o Git vai mostrar conflitos entre código se houver, aí basta você resolver eles manualmente (lembre-se em dúvida google e gpt são seus melhores amigos, eu sempre posso ajudar mas posso acabar não respondendo na hora).
-   **ATENÇÃO!!** Você **NUNCA** vai rodar esse comando antes de já ter todo seu código commitado senão você pode acabar sobreescrevendo seu código com o código que você acabou de puxar.
-   É bom executar esse comando logo após o seu último commit nessa branch antes de dar merge, claro vai dar na mesma resolver qualquer conflito que apareça aqui ou no merge, então é sua decisão.

# .ENV (O que eu adicionei até agora)

-   PORT: (Porta que o servidor roda)
-   DB_HOST: (Ip do banco de dados, se estiver rodando no seu pc vai ser localhost ou 127.0.0.1)
-   DB_USER: (Usuário do seu banco de dados)
-   DB_PASS: (Senha do banco de dados)
-   DB_NAME: (Nome do banco: dbReuse)
-   JWT_SECRET: (Senha para criptografia de login, pode por qualquer coisa aqui)
-   TOKEN_EXPIRY: (Tempo de duração do token de login, em milisegundos, eu uso: 259200000, para 3 dias )
-   SALT: (Usado como uma das bases para criptografar as senhas eu pessoalmente uso 10 mas não vai alterar o seu uso caso mudar)

# Considerações Finais

Bom, eu acho que é isso, como sempre em qualquer dúvida com qualquer coisa citada pode me perguntar, também nada que foi dito aqui é final, eu acabei escolhendo assim por gosto pessoal, e é minha primeira vez em muitas coisas que eu citei também, qualquer ideia ou proposta pra alterações estou disposto a conversar, afinal é um trabalho em dupla.

Boa sorte para nós :)

