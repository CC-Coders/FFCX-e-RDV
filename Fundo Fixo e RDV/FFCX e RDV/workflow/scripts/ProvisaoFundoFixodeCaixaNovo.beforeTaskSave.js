var ATIVIDADES = {
    INICIO: 7,
    INICIO_0: 0,
    APROVACAO_ENGENHEIRO: 8,
    APROVACAO_CONTABILIDADE: 6,
};

function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    var atividade = getValue("WKCurrentState");
    var FundoFixo = hAPI.getCardValue("campoFundoFixoDto");
    var modalidade = hAPI.getCardValue("modalidade");
    var tipo = hAPI.getCardValue("tipo");
    var attachments = hAPI.listAttachments();
    var decisaoAprovar = hAPI.getCardValue("aprovacao");
    var codigoFFCXCuritiba = "000557";

    if (atividade == ATIVIDADES.INICIO_0 || atividade == ATIVIDADES.INICIO) {
        if (modalidade == "Provisao") {
            insereProvisao();
        }
        if (modalidade == "Recebimento") {
            if (attachments.size() < 1 && FundoFixo != codigoFFCXCuritiba) {
                //Para a Modalidade Recebimento, é necessário anexar a NF na aba Anexos para os casos que o FFCX não seja a Matriz
                throw "<b>Favor anexar Notas Fiscais</b>";
            }

            var obj = buscaIdmovNumeroSerieChaveAcessoDoMovimento(tipo);
            var wsReport = geraRelatorioNoRM(obj);

            if (wsReport.values[0][0] == true) {
                var resultado = wsReport.values[0][1];
                CriaDocumentoNoGED_AnexaDocumentoDoGEDnoProcesso(resultado, obj.IDMOV);
            }
        }
    }

    if (FundoFixo == codigoFFCXCuritiba && atividade == ATIVIDADES.INICIO) {
        /*
         * Caso o fundo fixo seja Matriz Curitiba, define as variáveis para que realize a integração com o RM no inicío da solicitação
         * Sem precisar passar pela aprovação do Engenheiro e da Contabilidade
         */
        atividade = ATIVIDADES.APROVACAO_CONTABILIDADE;
        decisaoAprovar = "sim";
    }

    if (modalidade == "Recebimento" && decisaoAprovar != "sim") {
        enviaEmailReprovacao();
    }

    if (modalidade == "Recebimento" && atividade == ATIVIDADES.APROVACAO_CONTABILIDADE && decisaoAprovar == "sim") {
        var formaPgtoAntigo = "";
        var formaPgtoAtual = hAPI.getCardValue("formaPagamento");
        log.error("A forma de pagamento eh: " + formaPgtoAntigo + "e a atual eh: " + formaPgtoAtual);
        if (formaPgtoAntigo != formaPgtoAtual) {
            alteraFormaDePagamento();
        }

        faturaMovimento();
        enviaEmailAprovacao();
    }
}

function montaXMLatualizaMovimento() {
    var formaPgto = hAPI.getCardValue("formaPagamento");
    var condicaoPag = hAPI.getCardValue("condicaoPagamento");

    var newXml = "";
    var arrMovs = hAPI.getCardValue("valuesRecebimento");
    log.error("o valor de arrMovs: " + arrMovs);

    try {
        var jsonExportarRm1207 = JSON.parse(arrMovs);
        log.error("o valor de jsonExportarRm1207: " + JSON.stringify(jsonExportarRm1207));
    } catch (e) {
        log.error("Erro ao fazer parse de arrMovs: " + e.message);
        return null;
    }

    var coligada = hAPI.getCardValue("coligada");
    var tipo = hAPI.getCardValue("tipo");
    var motivoReembolso = hAPI.getCardValue("motivoReembolsoDto");

    newXml = "";
    newXml += "<MovMovimento>";

    for (var i = 0; i < jsonExportarRm1207.length; i++) {
        if (i == 0) {
            newXml += "<TMOV>";
            newXml += "<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
            newXml += "<IDMOV>" + jsonExportarRm1207[i].values.IDMOV + "</IDMOV>";
            if (coligada == 12 && tipo == "R.D.O") {
                newXml += "<CODTB1FLX>009</CODTB1FLX>";
            } else {
                newXml += "<CODTB1FLX>" + formaPgto + "</CODTB1FLX>";
            }
            newXml += "<CODCPG>" + condicaoPag + "</CODCPG>";
            newXml += "<HISTORICOCURTO>" + motivoReembolso + "</HISTORICOCURTO>";
            newXml += "</TMOV>";
        }
    }
    newXml += "</MovMovimento>";
    log.info("atualiza movimento valor de newxml: " + newXml);
    return newXml;
}

function createInsertXML(codtmv, motivoReembolso) {
    var IdMovVerif = hAPI.getCardValue("IdMovimento");
    var NumeroMovVerif = hAPI.getCardValue("NumeroMovimento");
    var FundoFixoVerif = hAPI.getCardValue("campoFundoFixoDto");
    var codColCFO = hAPI.getCardValue("codColFcoDto");
    var Filial = hAPI.getCardValue("campoFilialDto");
    var codLocalEstoque = hAPI.getCardValue("selectLocalEstoque");
    var jsonExportarRm = hAPI.getCardValue("codList");
    var tipo = hAPI.getCardValue("tipo");
    var modalidade = hAPI.getCardValue("modalidade");
    jsonExportarRm = JSON.parse(jsonExportarRm);
    var coligadaXML = hAPI.getCardValue("coligada");
    var motivoReembolsoDto = hAPI.getCardValue("motivoReembolsoDto");

    var xml =
        "<MovRM>\
            <TMOV>\
            <CODCOLIGADA>" +
        coligadaXML +
        "</CODCOLIGADA>\
            ";

    if (IdMovVerif == "") {
        xml +=
            "<IDMOV>-1</IDMOV>\
	            <NUMEROMOV>-1</NUMEROMOV>";
    } else {
        xml +=
            "<IDMOV>" +
            IdMovVerif +
            "</IDMOV>\
	            <NUMEROMOV>" +
            NumeroMovVerif +
            "</NUMEROMOV>";
    }
    if (motivoReembolso != "") {
        xml += "<HISTORICOCURTO>" + motivoReembolso + "</HISTORICOCURTO>";
    } else {
        xml += "<HISTORICOCURTO>" + motivoReembolsoDto + "</HISTORICOCURTO>";
    }
    xml +=
        "\
                <CODFILIAL>" +
        Filial +
        "</CODFILIAL>\
                <CODCFO>" +
                    FundoFixoVerif +
                "</CODCFO>\
                <CODCOLCFO>" + codColCFO+ "</CODCOLCFO>\
                <CODTMV>" +
        codtmv +
        "</CODTMV>\
                <TIPO>A</TIPO>\
                <STATUS>A</STATUS>\
                <CODMOEVALORLIQUIDO>R$</CODMOEVALORLIQUIDO>\
                <CODCFOAUX>" +
        FundoFixoVerif +
        "</CODCFOAUX>\
                <INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>\
                <CODCOLIGADA1>" +
        coligadaXML +
        "</CODCOLIGADA1>\
                <CODCPG>" +
        (coligadaXML == 12 && tipo == "R.D.O" ? "009" : coligadaXML == 2 && tipo == "Fundo Fixo" ? "002" : "001") +
        "</CODCPG>\
                <CODLOC>" +
        codLocalEstoque +
        "</CODLOC>\
         <CODTB1FLX>" +
            hAPI.getCardValue("formaPagamento") +
            "</CODTB1FLX>\
            </TMOV>\
            ";

    for (i = 0; i < jsonExportarRm.length; i++) {
        var Fornecedor = jsonExportarRm[i].fornecedor.trim();
        log.info("valor de fornecedor: " + Fornecedor);
        if (Fornecedor.indexOf("&") !== -1) {
            Fornecedor = Fornecedor.split("&").join("&amp;");
        }
        xml +=
            "\
            <TITMMOV>\
	            <CODCOLIGADA>" +
            coligadaXML +
            "</CODCOLIGADA>\
	            <NSEQITMMOV>" +
            (i + 1) +
            "</NSEQITMMOV>";
        if (IdMovVerif == "") {
            xml += "<IDMOV>-1</IDMOV>";
        } else {
            xml += "<IDMOV>" + IdMovVerif + "</IDMOV>";
        }
        xml +=
            "\
	            <HISTORICOCURTO> " +
            Fornecedor +
            "</HISTORICOCURTO>\
	            <IDPRD>" +
            jsonExportarRm[i].codigoProduto +
            "</IDPRD>\
	            <CODIGOPRD>" +
            jsonExportarRm[i].idProduto +
            "</CODIGOPRD>\
	            <NOMEFANTASIA>" +
            jsonExportarRm[i].nomeFantasia +
            "</NOMEFANTASIA>\
	            <QUANTIDADE>" + jsonExportarRm[i].quantidade + "</QUANTIDADE>\
	            <CODTB1FLX>" +
            hAPI.getCardValue("formaPagamento") +
            "</CODTB1FLX>\
	            <PRECOUNITARIO>" +
            jsonExportarRm[i].valorUnitario +
            "</PRECOUNITARIO>\
	            <CODUND>" +
            jsonExportarRm[i].unidade +
            "</CODUND>\
	            <CODCCUSTO> " +
            jsonExportarRm[i].codCC +
            "</CODCCUSTO>\
	            <CODLOC>" +
            codLocalEstoque +
            "</CODLOC>\
	            <VALORUNITARIO>" +
            jsonExportarRm[i].valorUnitario +
            "</VALORUNITARIO>\
	            <CODTB1FAT>" +
            jsonExportarRm[i].codTb1Fat +
            "</CODTB1FAT>\
            </TITMMOV>\
            <TITMMOVRATCCU>\
            ";
        if (IdMovVerif == "") {
            xml += "<IDMOV>-1</IDMOV>";
        } else {
            xml += "<IDMOV>" + IdMovVerif + "</IDMOV>";
        }
        xml +=
            "<CODCOLIGADA>" +
            coligadaXML +
            "</CODCOLIGADA>\
	            <NSEQITMMOV>" +
            (i + 1) +
            "</NSEQITMMOV>\
	            <CODCCUSTO>" +
            jsonExportarRm[i].codCC +
            "</CODCCUSTO>\
	            <VALOR>" +
            jsonExportarRm[i].valor +
            "</VALOR>\
	            <IDMOVRATCCU>-1</IDMOVRATCCU>\
            </TITMMOVRATCCU>\
	            ";
        for (j = 0; j < jsonExportarRm[i].depart.length; j++) {
            xml +=
                "\
                <TITMMOVRATDEP>\
	                <CODCOLIGADA>" +
                coligadaXML +
                "</CODCOLIGADA>";
            if (IdMovVerif == "") {
                xml += "<IDMOV>-1</IDMOV>";
            } else {
                xml += "<IDMOV>" + IdMovVerif + "</IDMOV>";
            }
            xml +=
                "\
	                <CODFILIAL>" +
                Filial +
                "</CODFILIAL>\
	                <NSEQITMMOV>" +
                (i + 1) +
                "</NSEQITMMOV>\
	                <CODDEPARTAMENTO>" +
                jsonExportarRm[i].depart[j].departamento +
                "</CODDEPARTAMENTO>\
	                <VALOR>" +
                jsonExportarRm[i].depart[j].valorDepartamento +
                "</VALOR>\
                </TITMMOVRATDEP>\
                ";
        }
    }
    xml += "</MovRM>";

    log.info("tester XML MOV: " + xml);
    return xml;
}

function createReceiptXML(codtmv, codtmvDestiny) {
    var usuario = hAPI.getCardValue("usuarioInicial");
    if (usuario == "ademir.rodrigues") {
        usuario = "Ademir";
    }

    usuario = "fluig.financeiro";
    var jsonExportarRm = hAPI.getCardValue("valuesRecebimento");
    jsonExportarRm = JSON.parse(jsonExportarRm);

    var dataAtual;
    var aprovacaoContabilidade = hAPI.getCardValue("aprovacaoContabilidade");
    var decisaoFaturamentoSim = hAPI.getCardValue("decisaoFaturamentoSim");

    var coligada = hAPI.getCardValue("coligada");

    if (decisaoFaturamentoSim == "sim") {
        var dataAtual = hAPI.getCardValue("dataFaturamento");
    } else if (aprovacaoContabilidade == "sim") {
        var dataAtual = hAPI.getCardValue("DataMovFaturado");
    }

    log.error("a data que ta eh" + dataAtual + "!!");

    var newXml = "";
    if (jsonExportarRm.length > 0) {
        newXml =
            "<MovFaturamentoProcParams>\
            <movCopiaFatPar>\
            <CodColigada>" +
            coligada +
            "</CodColigada>\
            <CodSistema>T</CodSistema>\
            <CodTmvDestino>" +
            codtmvDestiny +
            "</CodTmvDestino>\
            <CodTmvOrigem>" +
            codtmv +
            "</CodTmvOrigem>\
            <CodUsuario>" +
            usuario +
            "</CodUsuario>\
            <IdMov>\
                <int>" +
            jsonExportarRm[0].values.IDMOV +
            "</int>\
            </IdMov>\
            <dataBase>" +
            dataAtual +
            "</dataBase>\
            <dataEmissao>" +
            dataAtual +
            "</dataEmissao>\
            <dataExtra1>" +
            dataAtual +
            "</dataExtra1>\
            <TipoFaturamento>1</TipoFaturamento>\
            <efeitoPedidoFatAutomatico>2</efeitoPedidoFatAutomatico>\
            <listaMovItemFatAutomatico>";
    }

    for (z = 0; z < jsonExportarRm.length; z++) {
        var idMovimento = jsonExportarRm[z].values.IDMOV;
        var numSequencia = jsonExportarRm[z].values.NSEQITMMOV;
        var QUANTIDADE = jsonExportarRm[z].values.QUANTIDADE.replace(".",",");

        newXml +=
            "<MovItemFatAutomatico>\
            <CodColigada>" +
            coligada +
            "</CodColigada>\
            <Checked>1</Checked>\
            <IdMov>" +
            idMovimento +
            "</IdMov>\
            <NSeqItmMov>" +
            numSequencia +
            "</NSeqItmMov>\
            <Quantidade>" + QUANTIDADE + "</Quantidade>\
            </MovItemFatAutomatico>";
    }

    if (jsonExportarRm.length > 0) {
        newXml +=
            "</listaMovItemFatAutomatico>\
            <serie>1</serie>\
            <numeroMov>" +
            jsonExportarRm[0].values.NUMEROMOV +
            "</numeroMov>\
            <realizaBaixaPedido>true</realizaBaixaPedido>\
        </movCopiaFatPar>\
        </MovFaturamentoProcParams>";
    }
    return newXml;
}

function insereProvisao() {
    try {
        var motivoReembolso;
        var viagemCorporativa = hAPI.getCardValue("corporativaDto") == "sim" ? true : false;
        var viagemFamiliar = hAPI.getCardValue("familiarDto") == "sim" ? true : false;
        
        if (viagemCorporativa == true) {
            motivoReembolso = "Viagem Corporativa";
        } else if (viagemFamiliar == true) {
            motivoReembolso = "Visita Familiar";
        } else {
            motivoReembolso = "";
        }

        var tipo = hAPI.getCardValue("tipo");
        var coligada = hAPI.getCardValue("coligada");

        if (tipo == "R.D.O") {
            var codtmv = "1.1.09";
            var xmlStructure = createInsertXML(codtmv, motivoReembolso);

            var responseData = DatasetFactory.getDataset(
                "ImportaMovRM",
                null,
                [
                    DatasetFactory.createConstraint("xmlMov", xmlStructure, null, ConstraintType.MUST),
                    DatasetFactory.createConstraint("codColigada", coligada, null, ConstraintType.MUST),
                ],
                null
            );

            if (!responseData || responseData == "" || responseData == null) {
                throw "Houve um erro na comunicação com o webservice. Tente novamente!";
            } else {
                if (responseData.values[0][0] == "false") {
                    throw "Erro ao gerar movimento. Favor entrar em contato com o administrador do sistema. Mensagem: " + responseData.values[0][1];
                } else if (responseData.values[0][0] == "true") {
                    responseData.values[0][2];
                }
            }
        } else if (tipo == "Fundo Fixo") {
            var codtmv = "1.1.03";
            var xmlStructure = createInsertXML(codtmv, motivoReembolso);

            var responseData = DatasetFactory.getDataset(
                "ImportaMovRM",
                null,
                [
                    DatasetFactory.createConstraint("xmlMov", xmlStructure, null, ConstraintType.MUST),
                    DatasetFactory.createConstraint("codColigada", coligada, null, ConstraintType.MUST),
                ],
                null
            );

            if (!responseData || responseData == "" || responseData == null) {
                throw "Houve um erro na comunicação com o webservice. Tente novamente!";
            } else {
                if (responseData.values[0][0] == "false") {
                    throw "Erro ao gerar movimento. Favor entrar em contato com o administrador do sistema. Mensagem: " + responseData.values[0][1];
                } else if (responseData.values[0][0] == "true") {
                    responseData.values[0][2];
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

function buscaIdmovNumeroSerieChaveAcessoDoMovimento(tipo) {
    try {
        var OPERACAO = tipo == "Fundo Fixo" ? "ShowMovAprovacao" : "ShowMovAprovacaoRDO";
        var IdMovimento = hAPI.getCardValue("IdMovimento");

        var dsInformacoesDoMovimento = DatasetFactory.getDataset(
            "DatasetFFCXprod",
            null,
            [
                DatasetFactory.createConstraint("IDMOV", IdMovimento, IdMovimento, ConstraintType.MUST),
                DatasetFactory.createConstraint("OPERACAO", OPERACAO, OPERACAO, ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCOLIGADA", OPERACAO, OPERACAO, ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCOLCFO", hAPI.getCardValue("codColFcoDto"), hAPI.getCardValue("codColFcoDto"), ConstraintType.MUST)
            ],
            null
        );

        var parametroIdmov = dsInformacoesDoMovimento.values[0][0];
        var numeroSerie = dsInformacoesDoMovimento.values[0][4];
        var chaveAcesso = dsInformacoesDoMovimento.values[0][5];

        return {
            IDMOV: parametroIdmov,
            NUMEROSERIE: numeroSerie,
            CHAVEACESSO: chaveAcesso,
        };
    } catch (error) {
        throw error;
    }
}

function geraRelatorioNoRM(obj) {
    try {
        var coligada = hAPI.getCardValue("coligada");
        var tipo = hAPI.getCardValue("tipo");

        // TODO - Verificar como está buscando e o uso do numeroMov
        // Não encontrei no código original a definição da variável
        var numeroMov;

        var datasetReport = tipo == "Fundo Fixo" ? "GerarRelatorioProvisao" : "GerarRelatorioRDO";
        var wsReport = DatasetFactory.getDataset(
            datasetReport,
            null,
            [
                DatasetFactory.createConstraint("IDMOV", obj.IDMOV, obj.IDMOV, ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCOLIGADA", coligada, coligada, ConstraintType.MUST),
                DatasetFactory.createConstraint("NUMEROMOV", numeroMov, numeroMov, ConstraintType.MUST),
                DatasetFactory.createConstraint("SERIE", obj.NUMEROSERIE, obj.NUMEROSERIE, ConstraintType.MUST),
                DatasetFactory.createConstraint("CHAVEACESSONFE", obj.CHAVEACESSO, obj.CHAVEACESSO, ConstraintType.MUST),
            ],
            null
        );

        return wsReport;
    } catch (error) {
        throw error;
    }
}

function CriaDocumentoNoGED_AnexaDocumentoDoGEDnoProcesso(conteudo, IDMOV) {
    try {
        var processo = parseInt(getValue("WKNumProces"));

        var dataset = DatasetFactory.getDataset(
            "CriacaoDocumentosFluig",
            null,
            [
                DatasetFactory.createConstraint("processo", processo, processo, ConstraintType.MUST),
                DatasetFactory.createConstraint("idRM", IDMOV, IDMOV, ConstraintType.MUST),
                DatasetFactory.createConstraint("conteudo", conteudo, conteudo, ConstraintType.MUST),
            ],
            null
        );

        if (!dataset || dataset == "" || dataset == null) {
            throw "Houve um erro na comunicação com o webservice de criação de documentos. Tente novamente!";
        } else {
            if (dataset.values[0][0] == "false") {
                throw "Erro ao criar arquivo. Favor entrar em contato com o administrador do sistema. Mensagem: " + dataset.values[0][1];
            } else {
                hAPI.attachDocument(dataset.values[0][1]);
            }
        }
    } catch (error) {
        throw error;
    }
}

function alteraFormaDePagamento() {
    try {
        var coligada = hAPI.getCardValue("coligada");

        var xmlAtualizaMov = montaXMLatualizaMovimento();

        var retornoAtualizaMovimento = DatasetFactory.getDataset(
            "AtualizaMovimento",
            null,
            [
                DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST),
                DatasetFactory.createConstraint("pXML", xmlAtualizaMov, null, ConstraintType.MUST),
            ],
            null
        );

        if (!retornoAtualizaMovimento || retornoAtualizaMovimento == "" || retornoAtualizaMovimento == null) {
            throw "Houve um erro na comunicação com o webservice. Tente novamente!";
        }

        var FundoFixo = hAPI.getCardValue("campoFundoFixoDto");
        if (retornoAtualizaMovimento.values[0][0] == "false" && FundoFixo != "000557") {
            throw (
                "Não foi possível atualizar o movimento. Motivo: " +
                retornoAtualizaMovimento.values[0][1] +
                ". Favor verificar as informações ou entrar em contato com o administrador do sistema."
            );
        }

        return true;
    } catch (error) {
        throw error;
    }
}

function faturaMovimento() {
    try {
        var tipo = hAPI.getCardValue("tipo");
        var coligada = hAPI.getCardValue("coligada");

        var tiposDeMovimento = {
            "R.D.O":{
                codigoTipoMovimentoOrigem:"1.1.09",
                codigoTipoMovimentoDestino:"1.2.10",
            },
            "Fundo Fixo":{
                codigoTipoMovimentoOrigem:"1.1.03",
                codigoTipoMovimentoDestino:"1.2.07",
            },
        }

        var codigoTipoMovimentoOrigem = tiposDeMovimento[tipo].codigoTipoMovimentoOrigem;
        var codigoTipoMovimentoDestino = tiposDeMovimento[tipo].codigoTipoMovimentoDestino;
        var xmlFaturaMovimento = createReceiptXML(codigoTipoMovimentoOrigem, codigoTipoMovimentoDestino);

        var retorno = DatasetFactory.getDataset("FaturaMovimento",null,[
                DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST),
                DatasetFactory.createConstraint("pXML", xmlFaturaMovimento, xmlFaturaMovimento, ConstraintType.MUST),
            ],null);

        var FundoFixo = hAPI.getCardValue("campoFundoFixoDto");
        if (FundoFixo == "000557") {
            // Se o FFCX for Matriz, não verifica o retorno do faturamento
            // Necessário verificar a regra de negocio
            return true;
        }

        if (!retorno || retorno == "" || retorno == null) {
            throw "Houve um erro na comunicação com o webservice. Tente novamente!";
        } else if (retorno.values[0][0] == "false") {
            throw (
                "Não foi possível baixar a NF. Motivo: " + retorno.values[0][1] + ". Favor verificar as informações ou entrar em contato com o administrador do sistema."
            );
        }
    } catch (error) {
        throw error;
    }
}

// Mail
function enviaEmailAprovacao() {
    try {
        var processo = parseInt(getValue("WKNumProces"));
        var processoUrl = getServerURL() + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + processo;

        var mailAprovado = hAPI.getCardValue("mail");
        var engenheiroEmail = hAPI.getCardValue("emailEngenheiro");

        var filial = hAPI.getCardValue("campoFilialDto");
        var dataFormatada = hAPI.getCardValue("DataEmail");
        var tipo = hAPI.getCardValue("tipo");
        var localDeEstoque = hAPI.getCardValue("selectLocalEstoque");
        var IdMovimento = hAPI.getCardValue("IdMovimento");

        var jsonExportarRm1207 = hAPI.getCardValue("valuesRecebimento");
        jsonExportarRm1207 = JSON.parse(jsonExportarRm1207);
        var valor_total = parseFloat(jsonExportarRm1207[0].values.VALORBRUTO);

        if (tipo == "Fundo Fixo") {
            var htmlTemplate1 = "";
            htmlTemplate1 += "<p class='DescrMsgForum'>";
            htmlTemplate1 += "   Provisão de Fundo Fixo de Caixa aprovada, Nº <a href='" + processoUrl + "'target='_blank'>" + processo + "</a>.";
            htmlTemplate1 += "</p>";
            htmlTemplate1 += "<div class='DescrMsgForum actions' style='display:block'>";
            htmlTemplate1 += "   <br />";
            htmlTemplate1 += "   <div><b>Tipo:</b> " + tipo + "</div></br></br>";
            htmlTemplate1 += "   <div><b>Valor:</b> " + FormataValor(valor_total) + "</div></br>";
            htmlTemplate1 += "   <div><b>Data:</b> " + dataFormatada + "</div></br></br>";
            htmlTemplate1 += "   <div><b>Local de Estoque:</b> " + localDeEstoque + "</div></br>";
            htmlTemplate1 += "   <div><b>Filial: </b> " + filial + "</div> </br></br>";
            htmlTemplate1 += "   <div><b>Id Movimento: </b> " + IdMovimento + "</div></br>";
            htmlTemplate1 += "   <div><b>Nº: </b> " + hAPI.getCardValue("NumeroMovimento") + "</div></br></br>";
            htmlTemplate1 += "</div>";
            htmlTemplate1 += "<br>";

            var anexos1 = BuscaAnexosTemplate2();
            if (anexos1 != false && anexos1 != "") {
                htmlTemplate1 += "<div>";
                htmlTemplate1 += "  <p>";
                htmlTemplate1 += "    <b>Anexos:</b>";
                htmlTemplate1 += "    <ul>";
                htmlTemplate1 += "      " + anexos1;
                htmlTemplate1 += "      <br>";
                htmlTemplate1 += "    </ul>";
                htmlTemplate1 += "  </p>";
                htmlTemplate1 += "</div>";
            }

            sendCustomEmail(mailAprovado, engenheiroEmail, "[FLUIG] PROVISÃO Aprovada  " + processo, htmlTemplate1);
            sendCustomEmail(mailAprovado, "contabilidade@castilho.com.br", "[FLUIG] PROVISÃO Aprovada  " + processo, htmlTemplate1);
        } else if (tipo == "R.D.O") {
            var motivoreembolso = hAPI.getCardValue("motivoReembolsoDto");
            var htmlTemplate1 = "";
            htmlTemplate1 += "<p class='DescrMsgForum'>";
            htmlTemplate1 += "   R.D.O aprovada, Nº <a href='" + processoUrl + "'target='_blank'>" + processo + "</a>.";
            htmlTemplate1 += "</p>";
            htmlTemplate1 += "<div class='DescrMsgForum actions' style='display:block'>";
            htmlTemplate1 += "  <br />";
            htmlTemplate1 += "  <div><b>Tipo:</b> " + tipo + "</div></br></br>";
            htmlTemplate1 += "  <div><b>Valor:</b> " + FormataValor(valor_total) + "</div></br>";
            htmlTemplate1 += "  <div><b>Data:</b> " + dataFormatada + "</div></br></br>";
            htmlTemplate1 += "  <div><b>Local de Estoque:</b> " + localDeEstoque + "</div></br>";
            htmlTemplate1 += "  <div><b>Filial: </b> " + filial + "</div></br></br>";
            htmlTemplate1 += "  <div><b>Id Movimento: </b> " + IdMovimento + "</div></br>";
            htmlTemplate1 += "  <div><b>Nº: </b> " + hAPI.getCardValue("NumeroMovimento") + "</div></br></br>";
            htmlTemplate1 += "  <div><b>Motivo do reembolso da despesa: </b> " + motivoreembolso + "</div></br></br>";
            htmlTemplate1 += "</div>";
            htmlTemplate1 += "<br>";

            var anexos1 = BuscaAnexosTemplate2();
            if (anexos1 != false && anexos1 != "") {
                htmlTemplate1 += "<div>";
                htmlTemplate1 += "  <p>";
                htmlTemplate1 += "      <b>Anexos:</b>";
                htmlTemplate1 += "      <ul>";
                htmlTemplate1 += "          " + anexos1;
                htmlTemplate1 += "          <br>";
                htmlTemplate1 += "      </ul>";
                htmlTemplate1 += "  </p>";
                htmlTemplate1 += "</div>";
            }

            sendCustomEmail(mailAprovado, engenheiroEmail, "[FLUIG] PROVISÃO Aprovada  " + processo, htmlTemplate1);
            sendCustomEmail(mailAprovado, "contabilidade@castilho.com.br", "[FLUIG] PROVISÃO Aprovada  " + processo, htmlTemplate1);
        }
    } catch (error) {
        throw error;
    }
}
function enviaEmailReprovacao() {
    var atividade = getValue("WKCurrentState");
    var tipo = hAPI.getCardValue("tipo");
    var userEmail = hAPI.getCardValue("mail");
    var mailAprovado = hAPI.getCardValue("mail");
    var engenheiroEmail = hAPI.getCardValue("emailEngenheiro");
    var processo = parseInt(getValue("WKNumProces"));
    var processoUrl = getServerURL() + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + processo;

    if (atividade == ATIVIDADES.APROVACAO_ENGENHEIRO) {
        //Recusado Engenheiro
        if (tipo == "Fundo Fixo") {
            var htmlTemplateNaoAprovacao =
                "<p class='DescrMsgForum'>" +
                "Provisão Fundo Fixo de Caixa <b>REPROVADO</b> pelo(a) Engenheiro(a), " +
                "Nº <a href='" +
                processoUrl +
                "'target='_blank'>" +
                processo +
                "</a>." +
                "</p>" +
                "<div class='DescrMsgForum actions' style='display:block'>" +
                "<br />" +
                "<b>Acessar o chamado e verificar as correções a serem efetuados</b></br></br>";

            sendCustomEmail(mailAprovado, userEmail, "[FLUIG] Provisão RECUSADA  " + processo, htmlTemplateNaoAprovacao);
        } else if (tipo == "R.D.O") {
            var htmlTemplateNaoAprovacao =
                "<p class='DescrMsgForum'>" +
                "Despesas de R.D.O <b>REPROVADO</b> pelo(a) Engenheiro(a)," +
                "Solicitação Nº <a href='" +
                processoUrl +
                "'target='_blank'>" +
                processo +
                "</a>." +
                "</p>" +
                "<div class='DescrMsgForum actions' style='display:block'>" +
                "<br />" +
                "<b>Acessar o chamado e verificar as correções a serem efetuadas</b></br><br/></br>";

            sendCustomEmail(mailAprovado, userEmail, "[FLUIG] Despesas de R.D.O RECUSADA " + processo, htmlTemplateNaoAprovacao);
        }
    } else if (atividade == ATIVIDADES.APROVACAO_CONTABILIDADE) {
        //Recusado Contabilidade
        if (tipo == "Fundo Fixo") {
            var htmlTemplateNaoAprovacao =
                "<p class='DescrMsgForum'>" +
                "Provisão de Fundo Fixo de Caixa <b>REPROVADO</b> pelo setor Contabilidade," +
                "Nº <a href='" +
                processoUrl +
                "'target='_blank'>" +
                processo +
                "</a>." +
                "</p>" +
                "<div class='DescrMsgForum actions' style='display:block'>" +
                "<br />" +
                "<b>Acessar o chamado e verificar as correções a serem efetuados</b></br></br>";

            sendCustomEmail(mailAprovado, engenheiroEmail, "[FLUIG] Provisão RECUSADA  " + processo, htmlTemplateNaoAprovacao);
            sendCustomEmail(mailAprovado, userEmail, "[FLUIG] Provisão RECUSADA  " + processo, htmlTemplateNaoAprovacao);
        } else if (tipo == "R.D.O") {
            var htmlTemplateNaoAprovacao =
                "<p class='DescrMsgForum'>" +
                "Despesas de R.D.O <b>REPROVADO</b> pelo setor Contabilidade," +
                "Solicitação Nº <a href='" +
                processoUrl +
                "'target='_blank'>" +
                processo +
                "</a>." +
                "</p>" +
                "<div class='DescrMsgForum actions' style='display:block'>" +
                "<br />" +
                "<b>Acessar o chamado e verificar as correções a serem efetuados</b></br></br>";

            sendCustomEmail(mailAprovado, engenheiroEmail, "[FLUIG] Despesas de R.D.O RECUSADA  " + processo, htmlTemplateNaoAprovacao);
            sendCustomEmail(mailAprovado, userEmail, "[FLUIG] Despesas de R.D.O RECUSADA  " + processo, htmlTemplateNaoAprovacao);
        }
    }
}
function sendCustomEmail(to, from, subject, htmlBody) {
    var processo = parseInt(getValue("WKNumProces"));
    var url = getServerURL();

    log.info("html envio: " + htmlBody);
    var data = {
        companyId: getValue("WKCompany").toString(),
        serviceCode: "ServicoFluig",
        endpoint: "/api/public/alert/customEmailSender",
        method: "post",
        timeoutService: "100",
        params: {
            to: to,
            from: from,
            subject: subject,
            templateId: "TPL_SUPORTE_TI2",
            dialectId: "pt_BR",
            param: {
                CORPO_EMAIL: htmlBody,
                SERVER_URL: url,
                TENANT_ID: "1",
            },
        },
    };

    var clientService = fluigAPI.getAuthorizeClientService();
    var vo = clientService.invoke(JSONUtil.toJSON(data));

    if (vo.getResult() == null || vo.getResult().isEmpty()) {
        throw "Retorno esta vazio";
    } else {
        log.info(vo.getResult());
    }
}

// Utils
function getServerURL() {
    return fluigAPI.getPageService();
}
function FormataValor(valor_total) {
    var numero = parseFloat(valor_total);
    numero = numero.toFixed(2).split(".");
    numero[0] = "R$" + numero[0].split(/(?=(?:...)*$)/).join(".");
    return numero.join(",");
}
function BuscaEmailUsuario(usuario) {
    var ds = DatasetFactory.getDataset("colleague", null, [DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)], null);
    if (ds.values.length > 0) {
        var userEmail = ds.getValue(0, "mail");
        return userEmail;
    } else {
        return "";
    }
}
function BuscaAnexosTemplate2() {
    var retorno = "";
    var docs = hAPI.listAttachments();

    for (var i = 0; i < docs.size(); i++) {
        var doc = docs.get(i);
        retorno += "<li><a href='" + fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()) + "'>" + doc.getDocumentDescription() + "</a></li>";
    }

    return retorno;
}