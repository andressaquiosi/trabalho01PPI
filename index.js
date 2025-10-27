import express from 'express';
const host = '0.0.0.0';
const porta = 3000;
const server = express();

server.get('/', (req, res) => {
    if (Object.keys(req.query).length === 0) {
        return res.send(getInstructionPage());
    }
    const { idade, sexo, salario_base, anoContratacao, matricula } = req.query;
    const validationErrors = [];
    const currentYear = new Date().getFullYear();
    const parsedIdade = parseInt(idade);
    if (isNaN(parsedIdade) || parsedIdade <= 16) {
        validationErrors.push("Idade deve ser um número maior que 16.");
    }
    const parsedSalario = parseFloat(salario_base);
    if (isNaN(parsedSalario) || parsedSalario <= 0) {
        validationErrors.push("Salário base deve ser um número real válido e positivo.");
    }
    const parsedAno = parseInt(anoContratacao);
    if (isNaN(parsedAno) || parsedAno <= 1960 || parsedAno > currentYear) {
        validationErrors.push(`Ano de contratação deve ser um inteiro válido maior que 1960 e não superior ao ano atual (${currentYear}).`);
    }
    const parsedMatricula = parseInt(matricula);
    if (isNaN(parsedMatricula) || parsedMatricula <= 0) {
        validationErrors.push("Matrícula deve ser um inteiro válido maior que zero.");
    }
    const upperSexo = sexo ? sexo.toUpperCase() : '';
    if (upperSexo !== 'M' && upperSexo !== 'F') {
        validationErrors.push("Sexo deve ser 'M' (Masculino) ou 'F' (Feminino).");
    }
    if (validationErrors.length > 0) {
        return res.status(400).send(getErrorPage(validationErrors));
    }
    const anosDeServico = currentYear - parsedAno;
    let reajustePercentual = 0;
    let valorFixo = 0; // Negativo para desconto, positivo para acréscimo
    let ruleFound = false;

    if (parsedIdade >= 18 && parsedIdade <= 39) {
        ruleFound = true;
        if (upperSexo === 'M') {
            reajustePercentual = 10;
            valorFixo = (anosDeServico > 10) ? 17.00 : -10.00;
        } else { // 'F'
            reajustePercentual = 8;
            valorFixo = (anosDeServico > 10) ? 16.00 : -11.00;
        }
    } else if (parsedIdade >= 40 && parsedIdade <= 69) {
        ruleFound = true;
        if (upperSexo === 'M') {
            reajustePercentual = 8;
            valorFixo = (anosDeServico > 10) ? 15.00 : -5.00;
        } else { // 'F'
            reajustePercentual = 10;
            valorFixo = (anosDeServico > 10) ? 14.00 : -7.00;
        }
    } else if (parsedIdade >= 70 && parsedIdade <= 99) {
        ruleFound = true;
        if (upperSexo === 'M') {
            reajustePercentual = 15;
            valorFixo = (anosDeServico > 10) ? 13.00 : -15.00;
        } else { // 'F'
            reajustePercentual = 17;
            valorFixo = (anosDeServico > 10) ? 12.00 : -17.00;
        }
    }
    if (!ruleFound) {
        return res.status(400).send(getErrorPage([`Não há regra de reajuste definida para a idade informada (${parsedIdade}).`]));
    }
    const salarioIntermediario = parsedSalario * (1 + (reajustePercentual / 100));
    const novoSalario = salarioIntermediario + valorFixo;
    const resultData = {
        matricula: parsedMatricula,
        idade: parsedIdade,
        sexo: upperSexo,
        salario_base: parsedSalario,
        anoContratacao: parsedAno,
        anosDeServico: anosDeServico,
        novoSalario: novoSalario
    };
    return res.send(getResultPage(resultData));
});
function getStyles() {
    return `
        body { font-family: monospace; background-color: #f4f7f6; margin: 0; padding: 20px; display: grid; place-items: center; min-height: 90vh; }
        .container { max-width: 800px; margin: 20px auto; padding: 25px 40px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h1, h2 { color: #333; }
        pre, code { background-color: #f1f1f1; padding: 12px; border: 1px solid #ddd; border-radius: 6px; display: block; overflow-x: auto; font-family: "Courier New", Courier, monospace; }
        code a { color: #007bff; text-decoration: none; }
        ul { list-style-type: disc; margin-left: 20px; }
        li { margin-bottom: 10px; font-size: 1.1em; }
        .error { border-left: 6px solid #d9534f; }
        .error h1 { color: #d9534f; }
        .error li { color: #555; }
        .highlight { background-color: #f0f9e6; border: 2px solid #8ac926; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; }
        .highlight h2 { color: #5a8c0a; margin: 0; font-size: 2.5em; }
        a { color: #007bff; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: 500; }
        a:hover { text-decoration: underline; }
    `;
}
function getInstructionPage() {
    return `
        <html>
            <head><title>Cálculo de Reajuste</title><style>${getStyles()}</style></head>
            <body>
                <div class="container">
                    <h1>Cálculo de Reajuste Salarial</h1>
                    <p>Para calcular o reajuste, informe os dados do funcionário na URL (na barra de endereço do navegador).</p>
                    <p>Use o seguinte formato:</p>
                    <pre>/?idade=...&sexo=...&salario_base=...&anoContratacao=...&matricula=...</pre>
                    <h3>Exemplo de uso:</h3>
                    <code>
                        <a href="/?idade=18&sexo=F&salario_base=1700&anoContratacao=2014&matricula=12345">
                            http://localhost:3000/?idade=18&sexo=F&salario_base=1700&anoContratacao=2014&matricula=12345
                        </a>
                    </code>
                    <hr>
                    <h4>Regras de Validação:</h4>
                    <ul>
                        <li><strong>idade</strong>: Deve ser maior que 16.</li>
                        <li><strong>sexo</strong>: Deve ser 'M' ou 'F'.</li>
                        <li><strong>salario_base</strong>: Deve ser um número real válido (ex: 1500.50).</li>
                        <li><strong>anoContratacao</strong>: Deve ser um inteiro maior que 1960.</li>
                        <li><strong>matricula</strong>: Deve ser um inteiro maior que zero.</li>
                    </ul>
                </div>
            </body>
        </html>
    `;
}
function getErrorPage(errors) {
    return `
        <html>
            <head><title>Erro na Validação</title><style>${getStyles()}</style></head>
            <body>
                <div class="container error">
                    <h1>Não foi possível realizar o cálculo</h1>
                    <p>Os seguintes dados não são válidos ou estão ausentes:</p>
                    <ul>
                        ${errors.map(err => `<li>${err}</li>`).join('')}
                    </ul>
                    <a href="/">Voltar às instruções</a>
                </div>
            </body>
        </html>
    `;
}
function getResultPage(data) {
    return `
        <html>
            <head><title>Resultado do Cálculo</title><style>${getStyles()}</style></head>
            <body>
                <div class="container">
                    <h1>Relatório de Reajuste</h1>
                    <h2>Dados do Funcionário Informados</h2>
                    <ul>
                        <li><strong>Matrícula:</strong> ${data.matricula}</li>
                        <li><strong>Idade:</strong> ${data.idade} anos</li>
                        <li><strong>Sexo:</strong> ${data.sexo}</li>
                        <li><strong>Ano de Contratação:</strong> ${data.anoContratacao} (${data.anosDeServico} anos de empresa)</li>
                        <li><strong>Salário Base Anterior:</strong> ${data.salario_base.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                    </ul>
                    
                    <div class="highlight">
                        <strong>Novo Salário Reajustado:</strong>
                        <h2>${data.novoSalario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                    </div>
                    <a href="/">Realizar novo cálculo</a>
                </div>
            </body>
        </html>
    `;
}
server.listen(porta, host, () => {
    console.log(`Servidor escutando em http://${host}:${porta}`);
    console.log(`Para testar no seu navegador, acesse: http://localhost:${porta}`);
});