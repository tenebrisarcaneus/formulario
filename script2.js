document.addEventListener('DOMContentLoaded', function() {

    // --- ELEMENTOS DO DOM (Mantidos) ---
    const form = document.getElementById('rentalForm');
    const nomeCompleto = document.getElementById('nomeCompleto');
    const cpfInput = document.getElementById('cpf');
    const rgInput = document.getElementById('rg');
    const enderecoInput = document.getElementById('endereco');
    const telefoneInput = document.getElementById('telefone');
    const emailInput = document.getElementById('email');
    const notebookSelect = document.getElementById('notebook');
    const dataInicioInput = document.getElementById('dataInicio');
    const dataTerminoInput = document.getElementById('dataTermino');
    const consentCheckbox = document.getElementById('consentimento');
    const consentSection = document.querySelector('.consent-section');
    const generateContractButton = document.getElementById('generateContractButton');
    const validationMessageDiv = document.getElementById('validationMessage');
    const contractOutputArea = document.getElementById('contractOutputArea');
    const contractTextPre = document.getElementById('contractText');

    // --- DADOS FIXOS DO LOCADOR (VOCÊ - Mantidos) ---
    // #########################################################################
    // #####       PREENCHA COM SEUS DADOS REAIS ABAIXO                  #####
    // #########################################################################
    const locadorNome = "TecAluga SMM";
    const locadorIdentificacao = "CNPJ: 101.693.043-70"; // Ajustado conforme seu último script
    const locadorEndereco = "Rua Exemplo, 123, Bairro, São Mateus do Maranhão - MA, CEP 00000-000"; // Ajustado
    const seuNomeParaAssinatura = locadorNome;
    const suaCidade = "São Mateus do Maranhão";
    const seuEstado = "MA";
    const seuForo = `da comarca de ${suaCidade} - ${seuEstado}`;
    // #########################################################################
    // #####       VERIFIQUE OS DADOS ACIMA CUIDADOSAMENTE              #####
    // #########################################################################

    // --- MÁSCARAS DE INPUT (Mantidas) ---
    function formatCPF(cpf) {
        cpf = cpf.replace(/\D/g, ''); cpf = cpf.slice(0, 11);
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); return cpf;
    }
    function formatPhone(phone) {
        phone = phone.replace(/\D/g, ''); phone = phone.slice(0, 11);
        if (phone.length === 11) { phone = phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (phone.length === 10) { phone = phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        } else if (phone.length > 2) { phone = phone.replace(/^(\d{2})(\d)/, '($1) $2');
        } else if (phone.length > 0) { phone = phone.replace(/^(\d*)/, '($1'); }
        return phone;
    }
    cpfInput.addEventListener('input', (e) => { e.target.value = formatCPF(e.target.value); });
    telefoneInput.addEventListener('input', (e) => { e.target.value = formatPhone(e.target.value); });

    // --- VALIDAÇÃO (Mantida como antes) ---
     function showValidationMessage(message) { /* ...código mantido... */
        validationMessageDiv.textContent = message;
        validationMessageDiv.style.display = 'block';
        contractOutputArea.style.display = 'none';
     }
     function hideValidationMessage() { /* ...código mantido... */
        validationMessageDiv.textContent = '';
        validationMessageDiv.style.display = 'none';
     }
     function validateForm() { /* ...código mantido como na resposta anterior... */
        let isValid = true;
        hideValidationMessage();
        const invalidFields = form.querySelectorAll('.invalid');
        invalidFields.forEach(field => field.classList.remove('invalid'));
        consentSection.classList.remove('invalid');
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const isCheckbox = field.type === 'checkbox';
            if (!isCheckbox && (!field.value.trim() || (field.tagName === 'SELECT' && field.value === ""))) {
                 isValid = false; field.classList.add('invalid'); console.log("Campo inválido (vazio/select):", field.id);
            } else if (isCheckbox && !field.checked) {
                isValid = false; const parentSection = field.closest('.consent-section');
                 if(parentSection) { parentSection.classList.add('invalid'); } else { field.classList.add('invalid'); }
                console.log("Consentimento não marcado");
            }
        });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
             isValid = false; emailInput.classList.add('invalid'); console.log("Email inválido (formato)");
        }
        if (cpfInput.value && cpfInput.value.length !== 14) {
            isValid = false; cpfInput.classList.add('invalid'); console.log("CPF inválido (tamanho)");
        }
        if (telefoneInput.value && (telefoneInput.value.length < 14 || telefoneInput.value.length > 15)) {
             isValid = false; telefoneInput.classList.add('invalid'); console.log("Telefone inválido (tamanho)");
        }
        if (dataInicioInput.value && dataTerminoInput.value) {
            const inicio = new Date(dataInicioInput.value + "T00:00:00");
            const termino = new Date(dataTerminoInput.value + "T00:00:00");
            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
            if (inicio < hoje) {
                 isValid = false; dataInicioInput.classList.add('invalid');
                 showValidationMessage("A data de início não pode ser no passado."); console.log("Data de início no passado"); return false;
            }
            if (termino < inicio) {
                isValid = false; dataTerminoInput.classList.add('invalid'); dataInicioInput.classList.add('invalid');
                showValidationMessage("A data de término não pode ser anterior à data de início."); console.log("Data de término anterior ao início"); return false;
            }
        } else if (!dataInicioInput.value || !dataTerminoInput.value) {
             if(!dataInicioInput.value) dataInicioInput.classList.add('invalid'); if(!dataTerminoInput.value) dataTerminoInput.classList.add('invalid');
             isValid = false; console.log("Data de início ou término faltando");
        }
        if (!isValid && !validationMessageDiv.textContent) {
             showValidationMessage("Por favor, corrija os campos destacados e marque o consentimento.");
        }
        return isValid;
     }

    // --- GERAÇÃO DO DOCUMENTO (TEXTO - Mantida como antes) ---
    function generateContractDocument(data) { /* ...código mantido como na resposta anterior... */
        const formatarData = (dataISO) => {
            if (!dataISO) return 'N/A';
            const dateObj = new Date(dataISO + "T00:00:00"); const dia = String(dateObj.getDate()).padStart(2, '0');
            const mes = String(dateObj.getMonth() + 1).padStart(2, '0'); const ano = dateObj.getFullYear(); return `${dia}/${mes}/${ano}`;
        };
        const textoContrato = `--------------------------------------------------\n` + /* ... (resto do texto do contrato igual ao anterior) ... */
                              `          CONTRATO DE LOCAÇÃO DE NOTEBOOK\n` +
                              `--------------------------------------------------\n\n` +
                              `IDENTIFICAÇÃO DAS PARTES\n\n` +
                              `LOCADOR:\n` + `Nome/Razão Social: ${locadorNome}\n` + `Identificação: ${locadorIdentificacao}\n` + `Endereço: ${locadorEndereco}\n\n` +
                              `LOCATÁRIO:\n` + `Nome Completo: ${data.nome}\n` + `CPF: ${data.cpf}\n` + `RG: ${data.rg}\n` + `Endereço Completo: ${data.endereco}\n` + `Telefone: ${data.telefone}\n` + `Email: ${data.email}\n\n` +
                              `CLÁUSULA PRIMEIRA - DO OBJETO DA LOCAÇÃO\n` + `O presente contrato tem como OBJETO a locação de 01 (um) notebook, modelo ${data.notebook}, doravante denominado EQUIPAMENTO.\n\n` +
                              `CLÁUSULA SEGUNDA - DO PRAZO\n` + `A presente locação terá o prazo determinado, iniciando-se em ${formatarData(data.dataInicio)} e terminando em ${formatarData(data.dataTermino)}, data em que o EQUIPAMENTO deverá ser devolvido ao LOCADOR nas mesmas condições em que foi recebido, salvo o desgaste natural pelo uso normal.\n\n` +
                              `CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO\n` + `[CONFIRMAR/AJUSTAR] O valor total da locação é de R$ XXX,XX (valor por extenso), a ser pago [forma de pagamento - ex: via PIX CNPJ ${locadorIdentificacao.includes('CNPJ') ? locadorIdentificacao.split(': ')[1] : 'SEU_PIX'}, boleto, etc.] até a data de início da locação. [Detalhar multas/juros por atraso, se houver].\n\n` +
                              `CLÁUSULA QUARTA - DAS OBRIGAÇÕES DO LOCATÁRIO\n` + `a) Utilizar o EQUIPAMENTO exclusivamente para os fins a que se destina, com zelo e cuidado.\n` + `b) Responsabilizar-se por quaisquer danos (exceto defeito de fabricação não relacionado ao uso) causados ao EQUIPAMENTO por mau uso, negligência, imperícia, queda, derramamento de líquidos, ou uso indevido durante o período da locação, incluindo custos de reparo ou substituição.\n` + `c) Não sublocar, ceder ou emprestar o EQUIPAMENTO a terceiros sem prévia autorização escrita do LOCADOR.\n` + `d) Devolver o EQUIPAMENTO na data estipulada na Cláusula Segunda, nas condições recebidas, com todos os acessórios (fonte, cabos, etc.).\n` + `e) Informar o LOCADOR imediatamente sobre qualquer defeito, problema de funcionamento, ou sinistro (roubo, furto, dano) ocorrido com o EQUIPAMENTO.\n` + `f) Cumprir todas as cláusulas presentes nos Termos de Uso e Política de Privacidade, disponíveis nos links informados no formulário, os quais o LOCATÁRIO declara ter lido e concordado ao marcar o campo de consentimento.\n\n` +
                              `CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO LOCADOR\n` + `a) Entregar o EQUIPAMENTO em perfeitas condições de uso e funcionamento na data de início da locação.\n` + `b) Prestar suporte básico em caso de dúvidas sobre o funcionamento padrão do equipamento e sistema operacional fornecido.\n` + `c) Providenciar reparo ou substituição do equipamento em caso de defeito de fabricação que não seja decorrente de mau uso pelo LOCATÁRIO, dentro de um prazo razoável.\n\n` +
                              `CLÁUSULA SEXTA - DA ASSINATURA ELETRÔNICA (GOV.BR)\n` + `As partes reconhecem e concordam com a validade jurídica deste contrato quando assinado eletronicamente pelo LOCATÁRIO por meio da plataforma Gov.br (utilizando assinatura avançada ou qualificada), preferencialmente através do portal assinador.iti.br, nos termos da Lei nº 14.063/2020 e do Decreto nº 10.543/2020. A assinatura do LOCADOR está representada textualmente abaixo e será validada pelos registros da empresa.\n\n` +
                              `CLÁUSULA SÉTIMA - DO FORO\n` + `Fica eleito o foro ${seuForo} para dirimir quaisquer dúvidas ou litígios oriundos do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.\n\n\n` +
                              `E, por estarem assim justos e contratados, o LOCATÁRIO procederá com a assinatura eletrônica conforme instruções.\n\n` + `${suaCidade}, ${new Date().toLocaleDateString('pt-BR')}\n\n\n` +
                              `--------------------------------------------------\n` + `ASSINATURAS (Via Plataforma Gov.br - assinador.iti.br)\n` + `--------------------------------------------------\n\n` +
                              `LOCADOR:\n\n` + `/ Assinado Eletronicamente por ${seuNomeParaAssinatura} /\n` + `${locadorNome}\n` + `${locadorIdentificacao}\n\n\n` +
                              `LOCATÁRIO:\n\n` + `(Nome: ${data.nome})\n` + `(CPF: ${data.cpf})\n` + `/ Assinatura Eletrônica Gov.br a ser coletada via assinador.iti.br /\n` + `--------------------------------------------------\n`;
        return textoContrato;
    }

    // --- REMOVIDA FUNÇÃO downloadTextFile ---

    // --- AÇÃO DO BOTÃO PRINCIPAL (MODIFICADA PARA GERAR PDF) ---
    generateContractButton.addEventListener('click', () => {
        // 1. Validar o formulário
        if (!validateForm()) {
            validationMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; // Interrompe
        }

        // 2. Coletar os dados do formulário
        const formData = {
            nome: nomeCompleto.value.trim(), cpf: cpfInput.value.trim(), rg: rgInput.value.trim(),
            endereco: enderecoInput.value.trim(), telefone: telefoneInput.value.trim(), email: emailInput.value.trim(),
            notebook: notebookSelect.value, dataInicio: dataInicioInput.value, dataTermino: dataTerminoInput.value
        };

        // 3. Gerar o conteúdo (texto) do contrato
        const contractContent = generateContractDocument(formData);

        // 4. Exibir a prévia do contrato (ainda útil) e as instruções
        contractTextPre.textContent = contractContent; // Mostra prévia no <pre>
        contractOutputArea.style.display = 'block';
        hideValidationMessage();

        // 5. Gerar e iniciar o download do PDF
        try {
            // Garante que a biblioteca jsPDF foi carregada (pela tag <script> no HTML)
            if (typeof window.jspdf === 'undefined') {
                throw new Error("Biblioteca jsPDF não carregada. Verifique o link CDN no HTML.");
            }
            const { jsPDF } = window.jspdf;

            // Cria uma instância do jsPDF (padrão A4, retrato, milímetros)
            const doc = new jsPDF();

            // Define propriedades do documento (opcional)
            doc.setProperties({
                title: `Contrato Locação Notebook - ${formData.cpf}`,
                subject: 'Contrato de Locação TecAluga SMM',
                author: locadorNome,
            });

            // Define a fonte e o tamanho (Courier é bom para contratos, monoespaçada)
            doc.setFont('Courier', 'normal'); // Ou 'Helvetica', 'Times'
            doc.setFontSize(10); // Tamanho da fonte

            // Define as margens (em mm)
            const marginLeft = 15;
            const marginRight = 15;
            const marginTop = 20;
            const marginBottom = 20;
            const usableWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
            const pageHeight = doc.internal.pageSize.getHeight();

            // Posição Y inicial
            let currentY = marginTop;
            const lineHeight = 5; // Espaçamento entre linhas (ajuste conforme necessário)

            // Divide o texto do contrato em linhas baseado no '\n'
            const lines = contractContent.split('\n');

            // Adiciona cada linha ao PDF, cuidando das quebras de página
            lines.forEach(line => {
                // Verifica se a próxima linha caberá na página atual
                if (currentY + lineHeight > pageHeight - marginBottom) {
                    doc.addPage();       // Adiciona nova página
                    currentY = marginTop; // Reseta Y para a margem superior
                }

                // Adiciona o texto com largura máxima para quebrar linhas longas automaticamente
                const splitText = doc.splitTextToSize(line, usableWidth);
                doc.text(splitText, marginLeft, currentY);

                // Incrementa Y pela altura do texto adicionado (splitText é um array de linhas quebradas)
                currentY += (splitText.length * lineHeight);
            });


            // Cria o nome do arquivo PDF
            const sanitizedCpf = formData.cpf.replace(/\D/g, '');
            const filename = `contrato_locacao_notebook_${sanitizedCpf}.pdf`;

            // Salva o PDF, iniciando o download
            doc.save(filename);

            console.log(`Geração e download do PDF ${filename} iniciados.`);

        } catch (error) {
            console.error("Erro ao gerar ou salvar o PDF:", error);
            showValidationMessage(`Erro ao gerar o PDF: ${error.message}. Tente copiar o texto da prévia manualmente.`);
        }

        // 6. Rolar a página para a área do contrato gerado e instruções
        setTimeout(() => {
            contractOutputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        console.log("Processo concluído. Contrato gerado, exibido. Download do PDF tentado. Usuário instruído a usar assinador.iti.br.");

    });

});

