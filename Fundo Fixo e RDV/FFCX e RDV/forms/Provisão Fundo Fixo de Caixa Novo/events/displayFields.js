function displayFields(form, customHTML) {
    var usuario = getValue("WKUser");
    form.setValue("atividade", getValue('WKNumState'));
    var atividade = form.getValue("atividade");
    var adicionar = form.getFormMode();
    var DataEnvio = dataAtual();
    var usuario = getValue("WKUser");
    var mail;
    form.setValue("formMode", form.getFormMode());
    if (atividade == 0 || atividade == 4) {
        mail = fluigAPI.getUserService().getCurrent().getEmail();
        form.setValue("mail", mail)
        form.setValue("usuarioInicial", usuario)
        form.setValue("DataEnvio", DataEnvio)
    }
    
    if(atividade == 8){
        mail = fluigAPI.getUserService().getCurrent().getEmail();
        form.setValue("emailEngenheiro", mail)
    }

    if (atividade == 0 && adicionar == 'ADD') {
        form.setValue("DataMovFaturado", DataEnvio)
    }

    if (form.getFormMode() == "VIEW") {
        form.setValue("formMode", form.getFormMode());
        var tipo = form.getValue("campoTipoDto");
        var selectFilial = form.getValue("campoFilialDto");
        var selectLocalEstoque = form.getValue("ObraFiltro");
        var fundoFixo = form.getValue("campoFundoFixoDto");
        var modalidade = form.getValue("campoModalidadeDto");
        var formaPagamento = form.getValue("campoformaPagamentoDto");
        var condicaoPagamento = form.getValue("campoCondicaoPagamentoDto");

        form.setValue("tipo", tipo);
        form.setValue("selectFilial", selectFilial);
        form.setValue("selectLocalEstoque", selectLocalEstoque);
        form.setValue("fundoFixo", fundoFixo);
        form.setValue("modalidade", modalidade);
        form.setValue("formaPagamento", formaPagamento);
        form.setValue("condicaoPagamento", condicaoPagamento);
        form.setVisibleById("divFundoFixo", false); 
        form.setVisibleById("divFundoView", true); 
        form.setValue("fundoFixoView", fundoFixo);

        form.setVisibleById("divPagamento", true);
        form.setVisibleById("divFormaPgto", true); 
        form.setVisibleById("divCondicaoPagamento", true); 

        if(modalidade == "Provisao"){
            form.setVisibleById("mensagemNenhumaItem", false); 
            form.setVisibleById("tabelaMainRecebimento", true); 
            // var elements = document.querySelectorAll("[id^='divItensProdutos']");
    
            // elements.forEach(function(element) {
            //     form.setVisibleById(element.id, true);
            // });
        }
        else if(modalidade == "Recebimento"){
            form.setVisibleById("divPagamento", true);
            form.setVisibleById("divFormaPgto", true); 
            form.setVisibleById("divCondicaoPagamento", true); 
        }
    }
}

function dataAtual() {
    var data = new Date();
    var dia  = data.getDate();
    var mes  = data.getMonth() + 1;
    var ano  = data.getFullYear();

    dia  = (dia<=9 ? "0"+dia : dia);
    mes  = (mes<=9 ? "0"+mes : mes);

    var newData = dia+"/"+mes+"/"+ano;

    return newData;
}

