/*

Início            0/7
Gateway 1         10
Aprov. Engen.     8
Gateway 2         5
Aprov. Contab.    6
Gateway 3         11
Fim               9 

*/

const ATIVIDADES = {
    INICIO: 7,
    INICIO_0: 0,
    APROVACAO_ENGENHEIRO: 8,
    APROVACAO_CONTABILIDADE: 6,
};

var dataTableNovoItem;
var atividade = WKNumState;
var formMode = $("#formMode").val();

$(".divFaturamento").hide();
$(".DatadeHoje").val(getDataHoje("DD/MM/AAAA"));

var activityValue = document.getElementById("atividade").value;
var activity = parseInt(activityValue);

$("#dataAtual").val(getDataHoje("AAAA-MM-DD") + "T00:00:00.000");

$("#divFundoView, #divValorTotal, #titleValorTotal, #valorTotalFFCX").hide();

var ListProdutos = null;
var fundoFixoVerificacao = null;
var filialVerificacao = null;

$(document).ready(function () {
    bindings();
    escondeDivs();

    $("#fundoFixo").select2().addClass("form-control");
    $("#fundoFixo").next(".select2-container").find(".select2-selection--single").css("height", "32px");

    $(".js-example-basic-single").select2();
    $(".js-example-basic-single").select2({
        placeholder: "Selecione uma opção",
        allowClear: true,
        minimumInputLength: 1,
    });

    if (formMode == "VIEW") {
        var campoFundoFixo = $("#campoFundoFixoDto").val();
        $(".select2-container--bootstrap .select2-selection__rendered").text(campoFundoFixo);

        if ($("#modalidade").val() == "Provisao") {
            $("#mensagemNenhumaItem").hide();
            $(".divItensProdutos").hide();
            $("#tabelaMainRecebimento").show();
        } else if ($("#modalidade").val() == "Recebimento") {
            $("#divCondicaoPagamento").show();
            $("#divPagamento").show();
            $("#divFormaPgto").show();
        }

        var valueOfPayment = $("#formaPagamento").val();
        var textPlaceHolder = $("#formaDePagamentoPlaceHolder").val();
        $("#formaPagamento").empty();
        $("#formaPagamento").append(new Option(textPlaceHolder, valueOfPayment));

        if ($("#modalidade").text() == "Provisão") {
            carregaItensProvisaoModoView();
        } else {
            var tabela = $("#tabelaDeRecebimentos");

            if ($.fn.DataTable.isDataTable("#tabelaDeRecebimentos")) {
                tabela.DataTable().clear().draw();
                $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                    var tr = $(this).closest("tr");
                    var row = tabela.DataTable().row(tr);

                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass("shown");
                    } else {
                        row.child(format(row.data())).show();
                        tr.addClass("shown");
                    }
                });
                preencheTabelaReceber();
                return;
            } else {
                tabela.DataTable({
                    columns: [
                        {
                            className: "details-control",
                            align: "justified",
                            orderable: false,
                            data: null,
                            defaultContent: "",
                            targets: 1,
                            responsive: true,
                            render: function (data, type, row) {
                                return "<span></span>";
                            },
                        },
                        {
                            data: "IDMOV",
                            render: function (data, type, row) {
                                return "<input class='Idmov1207' readonly style='border: 0' value='" + data + "'>";
                            },
                        },
                        {
                            data: "NOMECENTRODECUSTO",
                            render: function (data, type, row) {
                                return "<input class='CentroDeCusto1207' readonly style='border: 0' value='" + data + "'>";
                            },
                        },
                        {
                            data: "VALORBRUTO",
                            render: function (data, type, row) {
                                return "<input class='ValorMov1207' readonly style='border: 0;' readonly value='" + FormataValor(data) + "'>";
                            },
                        },
                    ],
                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json",
                    },
                });

                $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                    var tr = $(this).closest("tr");
                    var row = tabela.DataTable().row(tr);

                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass("shown");
                    } else {
                        row.child(format(row.data())).show();
                        tr.addClass("shown");
                    }
                });
                preencheTabelaReceber();
            }

            $("#divTabelaDeRecebimentos").show();
            $("#mensagemNenhumaItem").hide();
        }
    }

    $("#tabelaRateio").DataTable({
        bPaginate: false,
        bLengthChange: false,
        bInfo: false,
        searching: false,
    });

    if (activity == 8 || activity == 6) {
        var valueOfPayment = $("#formaPagamento").val();
        var textPlaceHolder = $("#formaDePagamentoPlaceHolder").val();

        ChecaBotoes();

        $("#corporativa, #familiar").prop("disabled", true);
        $("#corporativa, #familiar").prop("readonly", true);

        $("#divValorTotal, #titleValorTotal, #valorTotalFFCX").hide();
        $("#formaPagamento").empty();
        $("#formaPagamento").append(new Option(textPlaceHolder, valueOfPayment));

        $("#tipo, #selectFilial, #selectLocalEstoque, #fundoFixo, #modalidade, #formaPagamento, #condicaoPagamento").prop("disabled", true);
        $("#divAprovar").show();

        if ($("#modalidade").val() == "Recebimento") {
            $("#divPagamento, #divFormaPgto, #titleFormaPagamento, #formaPagamento, #titleCondicaoPagamento, #condicaoPagamento, #divCondicaoPagamento").show();
        }

        clickInTheItens();
    }

    if (activity == 6) {
        $("#condicaoPagamento").prop("disabled", false);

        $(".divFaturamento").show();
        $("#dataFaturamento").hide();

        ChecaBotoes();
        handleAprovContabilidade();
    }

    if (activity == 7) {
        $("#select2-fundoFixo-container").attr("title");
        $("#modalidade").val("Provisao");

        ChecaBotoes();
    }

    if (activity == 8) {
        handleAprovEngenheiro();
        ChecaBotoes();
    }

    dataTableNovoItem = $("#tabelaProdutos").DataTable({
        pageLength: 10,
        columns: [
            { data: "IDPRD" },
            { data: "NOMEFANTASIA" },
            { data: "CODIGOPRD" },
            { data: "CODUNDCONTROLE" },
            {
                render: function (data, type, row) {
                    return "<button class='btn btn-success marginAuto btnSelecionaProduto' type='button' style='margin:auto;'>Adicionar</button>";
                },
                className: "dt-body-center fit-content",
            },
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json",
        },
    });

    AddCentroDeCusto();

    function escondeDivs() {
        $("#divbtnVoltarAosItens").hide();
        $("#dropaTable").hide();
        $("#rateiosContainer").hide();
        $("#painelTabelaDeProdutos").hide();
        $("#divAprovar").hide();
        $("#divFormaPgto").hide();
        $("#divCondicaoPagamento").hide();
        $("#divPagamento").hide();
        $("#divTabelaDeRecebimentos").hide();
        $("#faturamentoDecisao").hide();
        $("#motivoReembolsoTitulo").hide();
    }
});

function bindings() {
    $(document).on("click", ".btnSelecionaProduto", function () {
        var selectedRow = dataTableNovoItem.row($(this).closest("tr")).data();
        try {
            adicionarEstruturaAoArray(selectedRow);
            FLUIGC.toast({
                message: "Item incluido!",
                type: "success",
            });
        } catch {
            FLUIGC.toast({
                message: "Ocorreu um erro ao adicionar o item!",
                type: "danger",
            });
        }
    });
    $("[id^=tabItensProduto]").click(function () {
        $("[id^=atabInformacoesProduto]").removeClass("active");

        $(this).toggleClass("active");
        $(this).style.display = "flex";
    });
    $("[id^=atabInformacoesProduto]").click(function () {
        $("[id^=tabItensProduto]").removeClass("active");

        $(this).toggleClass("active");
        $(this).style.display = "flex";
    });
    $("#fundoFixo").on("change", function () {
        var fundoFixo = $("#fundoFixo").val();
        $("#campoFundoFixoDto").val(fundoFixo);
        $("#fundoFixo").val($("#campoFundoFixoDto").val());
        $("#formaPagamento").empty().trigger("change");
        puxaFormaPgto();
    });
    $("#modalidade").on("change", function () {
        var modalidade = $("#modalidade").val();
        $("#campoModalidadeDto").val(modalidade);
    });
    $("#formaPagamento").on("change", function () {
        var formaPagamento = $("#formaPagamento").val();
        $("#campoformaPagamentoDto").val(formaPagamento);
    });
    $("#condicaoPagamento").on("change", function () {
        var condicaoPagamento = $("#condicaoPagamento").val();
        $("#campoCondicaoPagamentoDto").val(condicaoPagamento);
    });
    $("#tipo").on("change", function () {
        var tipo = $("#tipo").val();
        $("#campoTipoDto").val(tipo);
        var linkElement = document.getElementById("atabItens");
        var linkElementPrincipal = document.getElementById("atabInformacoesIniciais");

        if (tipo == "Fundo Fixo") {
            linkElementPrincipal.textContent = "Informações do Fundo Fixo";
        } else if (tipo == "R.D.O") {
            linkElementPrincipal.textContent = "Informações do R.D.O";
        }
    });
    $("#selectFilial").on("change", function () {
        var selectedFilial = $("#selectFilial").val();
        $("#campoFilialDto").val(selectedFilial);
    });
    $("#selectLocalEstoque").on("change", function () {
        $("#ObraFiltro").val($("#selectLocalEstoque").val());
    });
    $('ul.nav.nav-tabs.nav-justified.nav-pills a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        if ($("#coltabs li:first").hasClass("active")) {
            $("#divTabelaDeRecebimentos").hide();
        }
    });
    $("#modalidade").on("change", function () {
        var firstOption = true;
        if (activity == 7) {
            $("#formaPagamento").empty();
            puxaFormaPgto();
            if (firstOption) {
                $("#fundoFixo option")
                    .filter(function () {
                        return $(this).text() === "001";
                    })
                    .remove();
                firstOption = false;
            }
        }
        if ($("#modalidade").val() == "Recebimento") {
            $("#divPagamento").show();
            $("#divFormaPgto").show();
            $("#divCondicaoPagamento").show();
            $("#formaPagamento").val("");
            $("#condicaoPagamento").val("");
            $("#formaPagamento").empty().trigger("change");
            puxaFormaPgto();
        } else {
            $("#divTabelaDeRecebimentos").hide();
            $("#divPagamento").hide();
            $("#divFormaPgto").hide();
            $("#divCondicaoPagamento").hide();
        }
    });
    $('input[type="radio"]').click(function () {
        if ($(this).prop("checked")) {
            var value = $(this).val();
        } else {
            $(this).removeAttr("value");
        }
    });
}

var itensArmazenados = [];

function ChecaBotoes() {
    if ($("#motivoReembolsoDto").val() == "Viagem Familiar") {
        $("#familiar").prop("checked", true);
        $("#corporativa").prop("checked", false);
    } else if ($("#motivoReembolsoDto").val() == "Viagem Corporativa") {
        $("#corporativa").prop("checked", true);
        $("#familiar").prop("checked", false);
    }
}

function ShowTotalValue() {
    if (activity == 8 || activity == 6) {
        $("#divValorTotal, #titleValorTotal, #valorTotalFFCX").hide();
    }

    if ($("#selectFilial").is(":visible")) {
        $("#divValorTotal, #titleValorTotal, #valorTotalFFCX").hide();
    }

    if ($("#divbtnAddItens").is(":visible")) {
        $("#divValorTotal, #titleValorTotal, #valorTotalFFCX").hide();
    }

    if ($("#tipo").val() == "Fundo Fixo" && $("#coligada").val() == 2) {
        $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue, #faturamentoDecisao").hide();
    }

    if ($("#tipo").val() == "R.D.O" && $("#modalidade").val() == "Provisao") {
        $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
        $("#faturamentoDecisao").show();
    }

    if ($("#tipo").val() == "R.D.O" && $("#modalidade").val() == "Recebimento" && $("#atividade").val() == 7) {
        $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
        $("#faturamentoDecisao").show();
    }
}

function adicionarEstruturaAoArray(selectedRow) {
    contadorItens++;
    var estrutura = {
        contador: contadorItens,
        descricao: selectedRow.NOMEFANTASIA,
        quantidade: selectedRow.CODUNDCONTROLE,
        codigoprd: selectedRow.CODIGOPRD,
    };

    itensArmazenados.push(estrutura);
}

function toggleCheckbox(currentCheckbox, otherCheckboxId) {
    const otherCheckbox = document.getElementById(otherCheckboxId);

    if (currentCheckbox.checked) {
        if (otherCheckboxId === "familiar") {
            $("#corporativaDto").val("sim");
            $("#familiarDto").val("nao");
        } else {
            $("#corporativaDto").val("nao");
            $("#familiarDto").val("sim");
        }

        if (otherCheckbox.checked) {
            otherCheckbox.checked = false;
            otherCheckbox.value = "nao";
        }
    } else {
        currentCheckbox.value = "nao";
    }

    currentCheckbox.value = currentCheckbox.checked ? "sim" : "nao";
}

var contadorItens = 0;

function exibirItensArmazenados() {
    var tipo = $("#tipo").val();
    if ($("#addItensBtn").is(":visible")) {
        itensArmazenados.forEach(function (item) {
            ordem++;
            var htmlStructure = `
      <div class="panel panel-primary divItensProdutos divNovosItens" style="margin-top: 20px" id="divItensProdutos${ordem}">
    <div class="panel-heading" style="border: 1px solid #000; padding: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="width: 15%; display: flex; align-items: center;">
            <div class="details detailsShow"></div>
            <div class="icon-green" id="icon-green${ordem}" onclick="MostraDivItem(${ordem})" style="margin-right: 10px;">+</div>
            <div class="icon-red" id="icon-red${ordem}" onclick="MostraDivItem(${ordem})"><span>-</span></div>
            <h3 class="panel-title countItem" style="margin: 0 10px;">Item ${ordem}</h3>
        </div>
        <div style="width: 70%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between;">
                <div style="width: 70%;">
                    <b>Fornecedor/Prestador: </b><p id="descricaoAtual${ordem}" style="display: inline;"></p>
                </div>
                <div style="width: 30%; text-align: left;">
                    <b>Quantidade:</b> <span id="inputQuantidadeItem${ordem}"></span> UN
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <div style="width: 70%;">
                    <b>Valor Unitário:</b> <span id="valorUnitEdicao${ordem}"></span>
                </div>
                <div style="width: 30%; text-align: left;">
                    <b>Valor Total:</b> <input type="text" readonly class="valorTotal" id="valorTotal${ordem}" style="background: transparent; border: none; width: 50%;">
                </div>
            </div>
        </div>
        <div style="width: 15%; display: flex; justify-content: flex-end;">
            <button class="btn btn-danger btnRemoverItem${ordem} btnRemoverItem" id="btnRemoverItem${ordem}" onclick="RemoveDivItem(${ordem})">
                <i class="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
            </button>
        </div>
    </div>
    <!-- Corpo do Painel -->
    <div class="panel-body divCorpoTabela" id="divCorpoTabela${ordem}">
        <div style="width: 100%;">
            <div>
                <div id="tabInformacoesProduto${ordem}">
                    <div>
                        <div>
                            <div class="row">
                                <div class="col-md-6 col-lg-6">
                                    <label class="labelFullWidth" style="width: 100%">Produto:
                                        <input name="ProdutoItem" type="text" class="form-control produto" readonly id="produto${ordem}" value="${
                item.descricao
            }"/>
                                    </label>
                                    <br>
                                </div>
                                <div class="col-md-6 col-lg-6" id="divInfoProdutos${ordem}">
                                    <div class="col-md-12 col-lg-12" style="padding: 0">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <label class="labelFullWidth" style="width: 100%">Quantidade:
                                                    <div class="with-suffix" suffix="UN">
                                                        <input type="text" class="form-control QuantidadeItem" id="QuantidadeItemEdicao${ordem}" oninput="AlteraQuantidadeEdicao(this, ${ordem}); atualizarValorTotal(${ordem}); atualizarValorTotalFFCX();" id="inputQuantidadeItem${ordem}" name="QuantidadeItem">
                                                    </div>
                                                </label>
                                                <br>
                                            </div>
                                            <div class="col-md-6" id="produtosInfo${ordem}">
                                                <label class="labelFullWidth" style="width: 100%">Valor Unitário:
                                                    <input type="text" name="ValorUnitItem" class="form-control ValorUnitItem" id="inputValorUnitEdicao${ordem}" oninput="FormataNumeros(this); atualizarValorTotalFFCX(); atualizarValorTotal(${ordem}); ${FormataValorInserir(
                this.val
            )}; AtualizaValorCampoValorUnitEdicao(${ordem})">
                                                </label>
                                                <br>
                                                <input type="hidden" name="codigo" id="codigo${ordem}" class="codigo" />
                                                <input type="hidden" name="unidade" id="unidade${ordem}" class="unidade"/>
                                                <input type="hidden" name="codigoProduto" id="codigoProduto${ordem}" class="codigoProduto"/>
                                                <input type="hidden" name="CodTb1Fat" id="CodTb1Fat${ordem}" class="CodTb1Fat"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-12" style="margin-top: 10px">
                                    <label class="labelFullWidth" style="width: 100%">Prestador/Fornecedor: 
                                        <textarea name="fornecedor" type="text" oninput="AlteraDescricao(this, ${ordem})" class="form-control fornecedor" id="fornecedor" value=""></textarea>
                                    </label>
                                    <br>
                                </div>
                                <div class="col-md-6" style="margin-top: 10px">
                                    <label class="labelFullWidth" style="width: 100%">Centro de Custo:
                                        <select class="form-control codCC" id="selectCentroDeCustoEdicao${ordem}" style="width: 100%; height: 32px;">
                                        </select>
                                    </label>
                                </div>
                                <div class="col-md-6 departamentoDiv" style="margin-top: 10px">
                                    <label class="labelFullWidth" style="width: 100%">Departamento:
                                        <select class="form-control departamento" id="departamentoHtmlEdicao${ordem}" style="width: 100%; height: 32px;">
                                            <option></option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <br>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
            +procuraProdutos(ordem);
            $("#tabItens").append(htmlStructure);
            $("selectCentroDeCustoEdicao" + ordem).addClass("form-control");
            $("#icon-green" + ordem).hide();
            AddDepartamentoHtml("departamentoHtmlEdicao" + ordem);
            AddSelectSubEmpreiteiro(ordem);
        });

        if (tipo == "R.D.O") {
            var itensProdutosVisiveis = $(".divItensProdutos:not(.divNovosItens):visible").length > 0;
            var novosItensVisiveis = $(".divNovosItens:visible").length > 0;

            if (itensProdutosVisiveis) {
                $("#faturamentoDecisao").show();
                $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
            } else if (novosItensVisiveis) {
                $("#faturamentoDecisao").show();
                $("#motivoReembolsoTitulo, #motivoReembolsoValue, #mensagemNenhumaItem").hide();
            } else {
                $("#faturamentoDecisao, #mensagemNenhumaItem").show();
                $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").show();
            }
        } else if (tipo == "Fundo Fixo" || tipo == "Recebimento") {
            if ($("[id^='divItensProdutos']").is(":visible") || $(".divNovosItens").is(":visible")) {
                $("#mensagemNenhumaItem").hide();
            }
            atualizarValorTotalFFCX();
        }
        itensArmazenados = [];
        atualizarValorTotalFFCX();
    }
}

function atualizarValorTotalFFCX() {
    const inputs = document.querySelectorAll(".valorTotal");
    let total = 0;

    inputs.forEach((input) => {
        let valor = input.value.replace(/\./g, "").replace(",", ".");
        valor = parseFloat(valor) || 0;
        total += valor;
    });

    document.getElementById("valorTotalFFCX").innerText =
        "R$ " +
        total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
}

function valorTotalRecebimento() {
    var total = 0;
    $(".ValorMov1207").each(function(){
        total += formataMoneyToFloat($(this).val());
    });

    document.getElementById("valorTotalFFCX").innerText =
        "R$ " +
        total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    $("#hiddenValorTotalFFCX").val(total);

}

function AtualizaValorCampoValorUnitEdicao(ordem) {
    var campoValorInputUnit = $("#inputValorUnitEdicao" + ordem).val();

    $("#valorUnitEdicao" + ordem).text(campoValorInputUnit);
}

function AlteraQuantidadeEdicao(element, idUnico) {
    let valor = $(element).val().replace(/\D/g, "");
    $("#inputQuantidadeItem" + idUnico).text(valor);
    $(element).val(valor);
}

function selecionarTipo() {
    var tituloFundo = $("#titleFundo");
    if ($("#tipo").val() == "Fundo Fixo") {
        tituloFundo.text("Selecione um Fundo Fixo");
    } else if ($("#tipo").val() == "R.D.O") {
        tituloFundo.text("Selecione um R.D.O");
    }
}

function hideLoadingIndicator() {
    var loaderDesativar = document.getElementsByClassName(".loader-container");
    var loader = document.getElementsByClassName(".loader");
    loaderDesativar.style.display = "none";
    loader.style.display = "none";
}

function AddSelectSubEmpreiteiro(identificador) {
    var constraints = [
        DatasetFactory.createConstraint("ATIVO", "T", "T", ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCCUSTO", "1.2.043", "1.2.043", ConstraintType.MUST_NOT),
    ];

    var wsReport = DatasetFactory.getDataset("GCCUSTO", null, constraints, null);

    if (wsReport && wsReport.values.length > 0) {
        for (var i = 0; i < wsReport.values.length; i++) {
            var codcusto = wsReport.values[i].CODCCUSTO;
            var nome = wsReport.values[i].NOME;

            var optionText = codcusto + " - " + nome;

            var option = $("<option>", {
                value: optionText,
                text: optionText,
            });

            $("#selectCentroDeCustoEdicao" + identificador).append(option);
            var centroDeCusto = $("#rateioPorCentroDeCusto").val();
            $("#selectCentroDeCustoEdicao" + identificador).val(centroDeCusto);
        }
    }
}

function FormataNumeros(element) {
    let valor = element.value;

    valor = valor.replace(/\D/g, "");

    if (valor.length === 0) {
        element.value = "";
        return;
    }

    let valorFormatado = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor / 100);

    element.value = valorFormatado;

    const ordem = element.id.match(/\d+/)[0];
    atualizarValorTotal(ordem);
}

function AlteraDescricao(element, idUnico) {
    $("#descricaoAtual" + idUnico).text($(element).val());
}

function AlteraQuantidade(element, idUnico) {
    let valor = $(element).val().replace(/\D/g, "");

    $("#quantidadeInput" + idUnico).text(valor);

    $(element).val(valor);
}

function redefinirIdsDepartamentoItem(contador) {
    var tabelaId = "#tableRateioDepartamento" + contador;
    var linhas = $(tabelaId + " tbody tr");

    linhas.each(function (index) {
        var novoId = "departamentoItem" + contador + "_" + (index + 1);
        $(this).find(".departamentoItem").attr("id", novoId);
    });
}

function recontarRateioTabelaRateio(contador) {
    var tabelaId = "#tableRateioDepartamento" + contador;
    var linhas = $(tabelaId + " tbody tr");

    $(tabelaId + " tbody").empty();

    linhas.each(function (index) {
        var numeroRateio = index + 1;
        $(this).find("td:first").text(numeroRateio);
        $(tabelaId + " tbody").append($(this));
    });
}

function preencherLocalEstoque(dsFinalLocEstoque, selectedFilial) {
    $("#selectLocalEstoque").html("");
    $("#selectLocalEstoque").append('<option value=" "></option>');

    for (var i = 0; i < dsFinalLocEstoque.length; i++) {
        if (selectedFilial == dsFinalLocEstoque[i].CODFILIAL) {
            var optionValue = dsFinalLocEstoque[i].CODCCUSTO + " - " + dsFinalLocEstoque[i].NOME;
            $("#selectLocalEstoque").append("<option value='" + optionValue + "'>" + optionValue + "</option>");
        }
    }
}

document.querySelectorAll("ul.nav.nav-tabs.nav-justified.nav-pills a.collapseItens").forEach(function (link) {
    var tipo = $("#tipo").val();
    if (formMode !== "VIEW") {
        link.addEventListener("click", function (event) {
            var campos = {
                tipo: "Tipo",
                selectFilial: "Selecione uma Filial",
                selectLocalEstoque: "Local de Estoque",
                fundoFixo: "Fundo Fixo",
                modalidade: "Modalidade",
            };

            var modalidade = $("#modalidade").val();

            if ($("#tabInformacoesIniciais").is(":visible")) {
                $("#divValorTotal, #titleValorTotal, #valorTotalFFCX, #faturamentoDecisao").hide();
            }

            if (modalidade == "Recebimento") {
                $("#titleValorTotal, #valorTotalFFCX").show();
            }

            for (var campoId in campos) {
                var valorCampo = $("#" + campoId)
                    .val()
                    .trim();
                var labelCampo = campos[campoId];

                if (valorCampo === "") {
                    $("#" + campoId).css("border", "1px solid red");
                    FLUIGC.toast({
                        title: "",
                        message: "Preencha o campo " + labelCampo,
                        type: "warning",
                    });

                    if ($("#fundoFixo").val() === "") {
                        $(".select2-selection select2-selection--single").css("border", "1px solid red");
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return;
                }
            }

            if (modalidade === "Recebimento") {
                var formaPagamento = $("#formaPagamento").val().trim();
                var condicaoPagamento = $("#condicaoPagamento").val().trim();
                if (formaPagamento === "") {
                    $("#formaPagamento").css("border", "1px solid red");
                    FLUIGC.toast({
                        title: "",
                        message: "Preencha o campo Forma de Pagamento",
                        type: "warning",
                    });
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return;
                }

                if (condicaoPagamento === "") {
                    $("#condicaoPagamento").css("border", "1px solid red");
                    FLUIGC.toast({
                        title: "",
                        message: "Preencha o campo Condição de Pagamento",
                        type: "warning",
                    });
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return;
                }
                $(this).attr("href", "#divTabelaDeRecebimentos");
                $("#divTabelaDeRecebimentos").show();

                if ($("#tipo").val() == "Fundo Fixo") {
                    $("#titleFundoSelecionado").text("Fundo Fixo:");
                    var fundoFixo = $("#fundoFixo").val();
                    var numeros = fundoFixo.match(/\d+/);
                    if (numeros !== null && numeros.length > 0) {
                        var fundoFixoSemCodigo = numeros[0];
                        $("#fundoSelecionado").text(fundoFixoSemCodigo);
                    } else {
                        $("#fundoSelecionado").text("Nenhum número encontrado");
                    }
                } else if ($("#tipo").val() == "R.D.O") {
                    if ($("[id^='divItensProdutos']").is(":visible") && $(".divNovosItens").is(":visible")) {
                        $("#mensagemNenhumaItem").hide();
                        $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").show();
                    } else {
                        $("#mensagemNenhumaItem").show();
                        if (tipo == "R.D.O") {
                            if (!$(".divNovosItens").is(":visible")) {
                                $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
                                $("#faturamentoDecisao").hide();
                            }
                        }
                    }
                    $("#titleValorTotal, #valorTotalFFCX").show();
                    $("#titleFundoSelecionado").text("Reembolso de Despesas da Obra (R.D.O):");
                    var fundoFixo = $("#fundoFixo").val();
                    var numeros = fundoFixo.match(/\d+/);
                    if (numeros !== null && numeros.length > 0) {
                        var fundoFixoSemCodigo = numeros[0];
                        $("#fundoSelecionado").text(fundoFixoSemCodigo);
                    } else {
                        $("#fundoSelecionado").text("Nenhum número encontrado");
                    }
                }
                atualizarValorTotalFFCX();
                var tabela = $("#tabelaDeRecebimentos");

                if ($.fn.DataTable.isDataTable("#tabelaDeRecebimentos")) {
                    tabela.DataTable().clear().draw();
                    $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                        var tr = $(this).closest("tr");
                        var row = tabela.DataTable().row(tr);

                        if (row.child.isShown()) {
                            row.child.hide();
                            tr.removeClass("shown");
                        } else {
                            row.child(format(row.data())).show();
                            tr.addClass("shown");
                        }
                    });
                    preencheTabelaReceber();
                    return;
                } else {
                    tabela.DataTable({
                        columns: [
                            {
                                className: "details-control",
                                align: "justified",
                                orderable: false,
                                data: null,
                                defaultContent: "",
                                targets: 1,
                                responsive: true,
                                render: function (data, type, row) {
                                    return "<span></span>";
                                },
                            },
                            {
                                data: "IDMOV",
                                render: function (data, type, row) {
                                    return "<input class='Idmov1207' readonly style='border: 0' value='" + data + "'>";
                                },
                            },
                            {
                                data: "NOMECENTRODECUSTO",
                                render: function (data, type, row) {
                                    return "<input class='CentroDeCusto1207' readonly style='border: 0' value='" + data + "'>";
                                },
                            },
                            {
                                data: "VALORBRUTO",
                                render: function (data, type, row) {
                                    return "<input class='ValorMov1207' readonly style='border: 0;' readonly value='" + FormataValor(data) + "'>";
                                },
                            },
                        ],
                        language: {
                            url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json",
                        },
                    });

                    $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                        var tr = $(this).closest("tr");
                        var row = tabela.DataTable().row(tr);

                        if (row.child.isShown()) {
                            row.child.hide();
                            tr.removeClass("shown");
                        } else {
                            row.child(format(row.data())).show();
                            tr.addClass("shown");
                        }
                    });
                    preencheTabelaReceber();
                }
                return;
            } else if (
                modalidade === "Provisao" &&
                $("#campoFundoFixoDto").val() != "" &&
                $("#campoTipoDto").val() != "" &&
                $("#campoFilialDto").val() != "" &&
                $("#ObraFiltro").val() != "" &&
                $("#campoModalidadeDto").val() != ""
            ) {
                $("#divbtnAddItens, .divItensProdutos, .divNovosItens, #divValorTotal, #titleValorTotal, #valorTotalFFCX").show();
                buscaProdutos();

                var fundoFixoValue = $("#fundoFixo").val();
                var filialValue = $("#selectFilial").val();
                $("#divTabelaDeRecebimentos").hide();
                $(this).attr("href", "#tabItens");
                if (fundoFixoVerificacao == null && filialVerificacao == null) {
                    fundoFixoVerificacao = $("#fundoFixo").val();
                    filialVerificacao = $("#selectFilial").val();
                    VerificaRetornoFundoFixo();
                    if (tipo == "R.D.O") {
                        if ($("#historicocurtoRdo").val() != "") {
                            $("#mensagemNenhumaItem, #faturamentoDecisao").hide();
                            $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").show();
                        } else {
                            $("#mensagemNenhumaItem, #faturamentoDecisao").show();
                            $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
                        }
                    } else if (tipo == "Fundo Fixo") {
                        $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
                    }
                }

                if (fundoFixoVerificacao != fundoFixoValue || filialVerificacao != filialValue) {
                    ordem = 0;
                    fundoFixoVerificacao = $("#fundoFixo").val();
                    filialVerificacao = $("#selectFilial").val();
                    removeDivsByClass("divItensProdutos");
                    VerificaRetornoFundoFixo();
                }
            }
        });
    }
    atualizarValorTotalFFCX();
});

function ListaLocalDeEstoque() {
    var p1 = DatasetFactory.createConstraint("OPERACAO", "ListaLocalDeEstoque", "ListaLocalDeEstoque", ConstraintType.SHOULD);
    var p2 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);
    var ds = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1], null);
    var dsFinalLocEstoque = ds.values;

    preencherLocalEstoque(dsFinalLocEstoque, $("#selectFilial").val());
}

function BuscaFilial() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset(
            "DatasetSolicitacaoDeCompraseServicos",
            null,
            [
                DatasetFactory.createConstraint("operacao", "BuscaFilial", "BuscaFilial", ConstraintType.MUST),
                DatasetFactory.createConstraint("codcoligada", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
            ],
            null,
            {
                success: (filiais) => {
                    var list = [];
                    filiais.values.forEach((filial) => {
                        list.push({
                            value: filial.CODFILIAL,
                            label: filial.CODFILIAL + " - " + filial.FILIAL,
                        });
                    });

                    $("#selectFilial").empty().append(new Option("", ""));

                    list.forEach((item) => {
                        $("#selectFilial").append(new Option(item.label, item.value));
                    });

                    resolve(list);
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar filiais: ",
                        message: error,
                        type: "warning",
                    });
                    reject();
                },
            }
        );
    });
}

function VerificaSeUsuarioPermissaoGeral() {
    var ds = DatasetFactory.getDataset(
        "colleagueGroup",
        ["colleagueId"],
        [
            DatasetFactory.createConstraint("colleagueId", $("#usuarioInicial").val(), $("#usuarioInicial").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("groupId", "Comprador", "Comprador", ConstraintType.SHOULD),
            DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD),
            DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD),
        ],
        null
    );

    if (ds.values.length > 0) {
        return true;
    } else {
        return false;
    }
}

function BuscaLocalDeEstoque() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset(
            "DatasetSolicitacaoDeCompraseServicos",
            null,
            [
                DatasetFactory.createConstraint("operacao", "BuscaLocalDeEstoque", "BuscaLocalDeEstoque", ConstraintType.MUST),
                DatasetFactory.createConstraint("codusuario", $("#usuarioInicial").val(), $("#usuarioInicial").val(), ConstraintType.MUST),
                DatasetFactory.createConstraint("codcoligada", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
                DatasetFactory.createConstraint("codfilial", $("#selectFilial").val(), $("#selectFilial").val(), ConstraintType.MUST),
                DatasetFactory.createConstraint(
                    "permissaoGeral",
                    VerificaSeUsuarioPermissaoGeral() ? "true" : "false",
                    VerificaSeUsuarioPermissaoGeral() ? "true" : "false",
                    ConstraintType.MUST
                ),
            ],
            null,
            {
                success: (locaisDeEstoque) => {
                    var list = [];
                    locaisDeEstoque.values.forEach((localDeEstoque) => {
                        list.push({
                            value: localDeEstoque.CODLOC,
                            label: localDeEstoque.CODLOC + " - " + localDeEstoque.NOME,
                        });
                    });

                    $("#selectLocalEstoque").empty().append(new Option("", ""));

                    list.forEach((item) => {
                        $("#selectLocalEstoque").append(new Option(item.label, item.value));
                    });

                    resolve(list);
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar local de estoque: ",
                        message: error,
                        type: "warning",
                    });
                    reject();
                },
            }
        );
    });
}

function puxaFormaPgto() {
    var formaDePagto = buscaFormaDePagamentoPorFundoFixo();

    var dataset = DatasetFactory.getDataset("DatasetFFCXprod", null, [
        DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("OPERACAO", "puxaFormaPagamentoFFCXRDO", "puxaFormaPagamentoFFCXRDO", ConstraintType.MUST),
        DatasetFactory.createConstraint("CODTB1FLX", formaDePagto, formaDePagto, ConstraintType.MUST),
    ], null);

    dsFinal = dataset.values;
    if (dsFinal.length > 0) {
        for (var i = 0; i < dataset.values.length; i++) {
            $("#formaPagamento").append("<option value='" + dsFinal[i].CODTB1FLX + "'>" + dsFinal[i].DESCRICAO + "</option>");
        }
    }

    function buscaFormaDePagamentoPorFundoFixo(){
        var tipo = $("#tipo").val();
        var modalidade = $("#modalidade").val();
        var fundoFixo = $("#campoFundoFixoDto").val();
        var coligada = $("#coligada").val();

        if (tipo == "R.D.O") {
            return "009";
        } 
        
        const formasDePagamento = {
            COLIGADAS:{
                1:{
                    fundoFixo:{
                        '020181':"002",//Carteira
                        '000604':"007",//Cheque Central Sul
                        '025894':"002",//Carteira
                        '000606':"003",//Cheque Regional Norte
                        '025895':"055",//Cheque Petrolina
                        '005784':"027",//Cheque Toledo II
                        '010915':"040",//Cheque Bonfim
                        '012230':"044",//Cheque Bom Jesus
                        '018384':"047",//Cheque Marco Rondon
                        '014914':"050",//Cheque Boiadeira
                        '016392':"052",//Cheque Bandeirantes
                        '016391':"053",//Cheque Eldorado
                        '024767':"054",//Cheque Oriente
                        '018115':"055",//Cheque Petrolina
                        '018596':"056",//Cheque Umuarama
                        '019453':"057",//Cheque Ipubi
                        '020115':"058",//Cheque MRS
                        '019610':"060",//Cheque Alagoas
                        '020811':"061",//Cheque Caarapó
                        "022155":"062",//Cheque Rodovia do Boi
                        "023133":"063",//Cheque Bujari
                        "024747":"064",//Cheque Guaíra
                        "026909":"065",//Cheque Três Pinheiros
                        "026911":"066",//Cheque Itaberaba
                        "027157":"067",//Cheque Inter 2
                        "026910":"068",//Cheque Três Meninas
                        "028418":"069",//Cheque VLI
                        "029190":"070",//Cheque Obras Iniciais A, C e D
                        "029191":"071",//Cheque Itabaiana
                        "029534":"072",//Cheque MRS Remodelação
                        "028452":"073",//Cheque COFCO
                        "031519":"076",//Cheque Palotina
                    }
                },
                2:{
                    fundoFixo:{
                        "018115":"002"//Carteira
                    }
                },
                6:{
                    fundoFixo:{}
                },
                12:{
                    fundoFixo:{}
                }
            }
        };


        var codFormaPagamento = formasDePagamento.COLIGADAS[coligada].fundoFixo[fundoFixo];
        if (!codFormaPagamento) {
            // Se nenhuma Forma de Pagamento for encontrada retorna 1
            codFormaPagamento = "1";
        }

        return codFormaPagamento;
    }
}

function AddItem() {
    var tipo = $("#tipo").val();
    if ($("#divbtnAddItens").is(":hidden")) {
        $(
            "#tabItens, #divbtnAddItens, .itens, [id^=divItensProdutos], [id^=divCorpoTabela], #icon-green, #divValorTotal, #titleValorTotal, #valorTotalFFCX"
        ).show();
        atualizarValorTotalFFCX();
        exibirItensArmazenados();
        $("#divbtnVoltarAosItens, #painelTabelaDeProdutos").hide();
    } else {
        $(
            "#mensagemNenhumaItem, #faturamentoDecisao, #icon-green, #divbtnAddItens, .itens, [id^=divItensProdutos], [id^=divCorpoTabela], #divValorTotal, #titleValorTotal, #valorTotalFFCX"
        ).hide();
        $("#divbtnVoltarAosItens, #icon-red, #rateiosContainer, #dropaTable, #icon-red, #painelTabelaDeProdutos").show();
    }
}

function FiltrarFfUsuario() {
    var tipo = $("#tipo").val();

    var p1 = DatasetFactory.createConstraint("ATIVO", "1", "1", ConstraintType.MUST);
    if (tipo == "Fundo Fixo") {
        var p2 = DatasetFactory.createConstraint("OPERACAO", "PuxarFundosFixos", "PuxarFundosFixos", ConstraintType.MUST);
    } else if (tipo == "R.D.O") {
        var p2 = DatasetFactory.createConstraint("OPERACAO", "PuxarRDO", "PuxarRDO", ConstraintType.MUST);
    }
    var ds = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null);

    if (ds.values.length > 0) {
        $("#fundoFixo").html("<option></option>");
        for (var i = 0; i < ds.values.length; i++) {
            $("#fundoFixo").append("<option value='" + ds.values[i].CODCFO + "'>" + ds.values[i].CODCFO + " - " + ds.values[i].NOME + "</option>");
        }
    }
}

function MostraDiv() {
    if ($("#icon-green").is(":hidden")) {
        $("#icon-red").hide();
        $("#icon-green").show();
        $("#rateiosContainer").slideUp();
    } else {
        $("#icon-red").show();
        $("#icon-green").hide();
        $("#rateiosContainer").slideDown().show();
    }
}

function MostraDivItem(contador) {
    if ($("#icon-green" + contador).is(":visible")) {
        $("#icon-red" + contador).show();
        $("#icon-green" + contador).hide();
        $("#divCorpoTabela" + contador)
            .slideDown()
            .show();
    } else {
        $("#icon-red" + contador).hide();
        $("#icon-green" + contador).show();
        $("#divCorpoTabela" + contador).slideUp();
    }
}

function AddCentroDeCusto() {
    $("#rateioPorCentroDeCusto").select2();
    var constraints = [
        DatasetFactory.createConstraint("ATIVO", "T", "T", ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCCUSTO", "1.2.043", "1.2.043", ConstraintType.MUST_NOT),
    ];

    var wsReport = DatasetFactory.getDataset("GCCUSTO", null, constraints, null);

    if (wsReport && wsReport.values.length > 0) {
        for (var i = 0; i < wsReport.values.length; i++) {
            var codcusto = wsReport.values[i].CODCCUSTO;
            var nome = wsReport.values[i].NOME;

            var optionText = codcusto + " - " + nome;

            var option = $("<option>", {
                value: optionText,
                text: optionText,
            });

            $("#rateioPorCentroDeCusto").append(option);
        }
    }
}

function AddDepartamentoItem(select) {
    var filial = $("#selectFilial").val();
    var id = select ? select.id : null;

    if (filial != 0 || filial != "" || filial != null) {
        var constraints = [
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", filial, filial, ConstraintType.MUST),
        ];

        var wsReport = DatasetFactory.getDataset("DepartamentosRM", null, constraints, null);

        if (wsReport && wsReport.values.length > 0) {
            $(".departamentoItem").each(function () {
                var existingSelectId = this.id;

                $("#" + existingSelectId).empty();

                $("#" + existingSelectId).append(
                    $("<option>", {
                        value: "",
                        text: "",
                    })
                );

                for (var i = 0; i < wsReport.values.length; i++) {
                    var coddepartamento = wsReport.values[i].coddepartamento;
                    var nome = wsReport.values[i].nome;

                    var optionText = coddepartamento + " - " + nome;

                    var option = $("<option>", {
                        value: coddepartamento,
                        text: optionText,
                    });

                    $("#" + existingSelectId).append(option);
                }

                $("#" + existingSelectId).val(wsReport.values[0].coddepartamento);
            });

            if (select) {
                $("#" + id).empty();

                $("#" + id).append(
                    $("<option>", {
                        value: "",
                        text: "",
                    })
                );

                for (var i = 0; i < wsReport.values.length; i++) {
                    var coddepartamento = wsReport.values[i].coddepartamento;
                    var nome = wsReport.values[i].nome;

                    var optionText = coddepartamento + " - " + nome;

                    var option = $("<option>", {
                        value: coddepartamento,
                        text: optionText,
                    });

                    $("#" + id).append(option);
                }

                $("#" + id).val(wsReport.values[0].coddepartamento);
            }
        }
    }
}

function AddDepartamento(select) {
    var filial = $("#selectFilial").val();
    var id = select ? select.id : null;

    if (filial != 0 || filial != "" || filial != null) {
        var constraints = [
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", filial, filial, ConstraintType.MUST),
        ];

        var wsReport = DatasetFactory.getDataset("DepartamentosRM", null, constraints, null);

        if (wsReport && wsReport.values.length > 0) {
            $(".departamento").each(function () {
                var existingSelectId = this.id;

                $("#" + existingSelectId).empty();

                $("#" + existingSelectId).append(
                    $("<option>", {
                        value: "",
                        text: "",
                    })
                );

                for (var i = 0; i < wsReport.values.length; i++) {
                    var coddepartamento = wsReport.values[i].coddepartamento;
                    var nome = wsReport.values[i].nome;

                    var optionText = coddepartamento + " - " + nome;

                    var option = $("<option>", {
                        value: coddepartamento,
                        text: optionText,
                    });

                    $("#" + existingSelectId).append(option);
                }

                $("#" + existingSelectId).val(wsReport.values[0].coddepartamento);
            });

            if (select) {
                $("#" + id).empty();

                $("#" + id).append(
                    $("<option>", {
                        value: "",
                        text: "",
                    })
                );

                for (var i = 0; i < wsReport.values.length; i++) {
                    var coddepartamento = wsReport.values[i].coddepartamento;
                    var nome = wsReport.values[i].nome;

                    var optionText = coddepartamento + " - " + nome;

                    var option = $("<option>", {
                        value: coddepartamento,
                        text: optionText,
                    });

                    $("#" + id).append(option);
                }

                $("#" + id).val(wsReport.values[0].coddepartamento);
            }
        }
    }
}

function buscaProdutos() {
    var tipo = $("#tipo").val();
    var constraints = [
        DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("TipoProduto", "OC/OS", "OC/OS", ConstraintType.MUST),
    ];

    if (tipo === "R.D.O") {
        constraints.push(DatasetFactory.createConstraint("Tipo", "RDO", "RDO", ConstraintType.SHOULD));
    }

    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("BuscaProdutosRMRDO", null, constraints, null, {
            success: (produtos) => {
                var mappedProdutos = produtos.values.map((produto) => ({
                    IDPRD: produto.IDPRD,
                    NOMEFANTASIA: produto.NOMEFANTASIA,
                    CODIGOPRD: produto.CODIGOPRD,
                    CODUNDCONTROLE: produto.CODUNDCONTROLE,
                }));

                resolve(mappedProdutos);
                dataTableNovoItem.clear();

                dataTableNovoItem.rows.add(mappedProdutos);
                dataTableNovoItem.draw();
            },
            error: (error) => {
                reject();
            },
        });
    });
}

function RemoveDivItem(idBotaoRemover) {
    var classeItem = document.getElementById("divItensProdutos" + idBotaoRemover);
    var parentElement = classeItem.parentNode;
    parentElement.removeChild(classeItem);

    for (var i = 0; i < itensArmazenados.length; i++) {
        if (itensArmazenados[i].contador === idBotaoRemover) {
            itensArmazenados.splice(i, 1);
            break;
        }
    }

    var divs = document.querySelectorAll(".divItensProdutos");
    divs.forEach((div, index) => {
        var newOrder = index + 1;
        var itemId = div.id.match(/\d+/)[0];

        div.querySelector(".panel-title").textContent = `Item ${newOrder}`;
        var btnRemover = div.querySelector(".btnRemoverItem" + itemId);
        btnRemover.setAttribute("onclick", `RemoveDivItem(${newOrder})`);
        btnRemover.classList.remove(`btnRemoverItem${itemId}`);
        btnRemover.classList.add(`btnRemoverItem${newOrder}`);
        div.id = "divItensProdutos" + newOrder;
    });

    itensArmazenados.forEach((item, index) => {
        item.contador = index + 1;
    });
    var tipo = $("#tipo").val();

    if (divs.length === 0) {
        $("#mensagemNenhumaItem").show();
        atualizarValorTotalFFCX();
        if (tipo == "R.D.O") {
            $("#faturamentoDecisao").hide();
        }
    } else {
        $("#mensagemNenhumaItem").hide();
        if (tipo == "R.D.O") {
            $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
            $("#faturamentoDecisao").hide();
        }
    }

    ordem = divs.length;
    atualizarValorTotalFFCX();
}

function preencheTabelaReceber() {
    var codfco = $("#campoFundoFixoDto").val() ? $("#campoFundoFixoDto").val() : $("#campoFundoFixoDto").text();
    var codfcoAtt = codfco.slice(0, 6);
    var tipo = $("#tipo").val() ? $("#tipo").val() : $("#tipo").text();
    var coligada = $("#coligada").val() ? $("#coligada").val() : $("#coligada").text().split(" - ")[0];
    var localDeEstoque = $("#ObraFiltro").val() ? $("#ObraFiltro").val() : $("#ObraFiltro").text();

    var c1 = DatasetFactory.createConstraint("CODCOLIGADA", coligada, coligada, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("CODCFO", codfcoAtt, codfcoAtt, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("FILIAL", $("#campoFilialDto").val(), $("#campoFilialDto").val(), ConstraintType.SHOULD);
    var c4 = DatasetFactory.createConstraint("CODLOC", localDeEstoque, localDeEstoque, ConstraintType.MUST);

    if (tipo == "Fundo Fixo") {
        var c5 = DatasetFactory.createConstraint("OPERACAO", "SelectMov", "SelectMov", ConstraintType.MUST);
    } else if (tipo == "R.D.O") {
        var c5 = DatasetFactory.createConstraint("OPERACAO", "SelectMovRDO", "SelectMovRDO", ConstraintType.MUST);
    }

    var dsPreencherTabela = DatasetFactory.getDataset("DatasetFFCXprod", null, [c1, c2, c3, c4, c5], null);

    if (dsPreencherTabela.values && dsPreencherTabela.values.length > 0) {
        let itensStatusA = dsPreencherTabela.values.filter((registro) => registro.STATUS === "A");

        if (itensStatusA.length > 0) {
            var IdMovparaAlteracao = itensStatusA[0].IDMOV;
            var NumeroMovparaAlteracao = itensStatusA[0].NUMEROMOV;
            $("#IdMovimento").val(IdMovparaAlteracao);
            $("#NumeroMovimento").val(NumeroMovparaAlteracao);

            var tabela = $("#tabelaDeRecebimentos").DataTable();

            if ($.fn.DataTable.isDataTable("#tabelaDeRecebimentos")) {
                tabela = $("#tabelaDeRecebimentos").DataTable();
                tabela.clear().draw();
            }

            itensStatusA.sort((a, b) => b.IDMOV - a.IDMOV);

            tabela.row.add(itensStatusA[0]).draw();

            $("#tabelaDeRecebimentos tbody").off("click");

            $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                var tr = $(this).closest("tr");
                var row = tabela.row(tr);
                var values = row.data();
                var IDMOV = values.IDMOV;

                if (row.child.isShown()) {
                    $(this).attr("rowspan", "1");
                    row.child.hide();
                    tr.removeClass("shown");
                } else {
                    row.child(mostrarDetalhes(IDMOV)).show();
                    $(this).attr("rowspan", "2");
                    tr.addClass("shown");
                }
            });
        } else {
            console.warn("Nenhum registro com STATUS 'A' foi encontrado.");
        }
    }

    valorTotalRecebimento();
}

function mostrarDetalhes(IDMOV) {
    var coligada = $("#coligada").val() ? $("#coligada").val() : $("#coligada").text().split(" - ")[0];

    var p1 = DatasetFactory.createConstraint("IDMOV", IDMOV, IDMOV, ConstraintType.MUST);
    var p2 = DatasetFactory.createConstraint("CODCOLIGADA", coligada, coligada, ConstraintType.MUST);
    var p3 = DatasetFactory.createConstraint("OPERACAO", "SelectItem", "SelectItem", ConstraintType.MUST);

    var DatasetShowItems = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2, p3], null);

    var p1 = DatasetFactory.createConstraint("IDMOV", IDMOV, IDMOV, ConstraintType.MUST);
    var p2 = DatasetFactory.createConstraint("CODCOLIGADA", coligada, coligada, ConstraintType.MUST);
    var p3 = DatasetFactory.createConstraint("OPERACAO", "ShowRateioDepartamento", "ShowRateioDepartamento", ConstraintType.MUST);

    var datasetshowRateiosDepatamento = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2, p3], null);

    var p1 = DatasetFactory.createConstraint("IDMOV", IDMOV, IDMOV, ConstraintType.MUST);
    var p2 = DatasetFactory.createConstraint("CODCOLIGADA", coligada, coligada, ConstraintType.MUST);
    var p3 = DatasetFactory.createConstraint("OPERACAO", "ShowRateioCentroDeCusto", "ShowRateioCentroDeCusto", ConstraintType.MUST);

    var datasetshowRateiosCentrodeCusto = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2, p3], null);

    var retorno = "";
    var numeracao = 1;

    for (total = 0; total < DatasetShowItems.values.length; total++) {
        retorno +=
            '<div class="panel panel-primary divItensProdutos">\
    <div class="cabecalhoReceber panel-heading">\
    <div class="row">\
      <div class="col-md-10">\
          <span\
          class="RegistroItemRec"\
          id="RegistroItemRec"\
          style="font-size: medium; font-weight: bold"\
        >Item ' +
            numeracao +
            '\
        </span>\
      </div>\
      <div id="divFatItem" class="divFatItem">\
          <b><span>Faturar </span></b>';
        if ($(".CheckFatItem").val() == "notChecked") {
            retorno += '<input type="checkbox" id="CheckFatItem" name="CheckFatItem" class="CheckFatItem"/>';
        } else {
            retorno += '<input type="checkbox" id="CheckFatItem" name="CheckFatItem" class="CheckFatItem" checked/>';
        }
        retorno +=
            '<input type="hidden" name="ValNum" id="ValNum" class="ValNum" value="' +
            numeracao +
            ' "style="display: none"/>\
      </div>\
    </div>\
  </div>';
        retorno +=
            '<div class="panel-group" id="accordion" class="accordion" style="margin-bottom: 0px">\
      <div class="itens1207 panel panel-default">\
       <div class="panel-heading">\
      <h4 class="panel-title">\
             <a class="collapse-icon collapsed" data-toggle="collapse" data-parent="#accordion" href="#' +
            DatasetShowItems.values[total].NSEQITMMOV +
            '" >\
               <div class="row">\
               <div id="divFornecedor" class="col-md-12">\
                 <span style="font-weight: bold">Fornecedor: </span>\
                 <input class="Fornecedor1207" readonly="" \
                   value="' +
            DatasetShowItems.values[total].HISTORICOCURTO +
            '"\
                   style="border: 0; width: 90%"\
                 />\
               </div>\
             </div>\
             <div class="row" style="margin-top: 12px">\
               <div id="divProduto" class="col-md-9">\
                 <span style="font-weight: bold">Produto: </span>\
                 <input\
                   class="Produto1207"\
                   readonly=""\
                   style="border: 0; width:80%"\
                   value="' +
            DatasetShowItems.values[total].NOMEFANTASIA +
            "-" +
            DatasetShowItems.values[total].CODIGOPRD +
            '"\
                 />\
               </div>\
               <div id="divValor" class="col-md-3">\
                 <span style="font-weight: bold">Total: </span>\
                 <input\
                   class="Valor1207"\
                   readonly=""\
                   style="border: 0; width:75%"\
                   value="' +
            FormataValor(DatasetShowItems.values[total].PRECOUNITARIO) +
            '"\
                 />\
               </div>\
             </div>\
                </a\
             >\
           </h4>\
         </div>\
         <div id="' +
            DatasetShowItems.values[total].NSEQITMMOV +
            '" class="panel-collapse collapse">\
         <div class="panel-body detailsMov">\
          <div class="divRatCCusto1207 col-md-4"\
           <p>\
            <b style="padding-right:1.5rem"> Centro de Custo: </b>\
           </p>';
        for (h = 0; h < datasetshowRateiosCentrodeCusto.values.length; h++) {
            if (DatasetShowItems.values[total].NSEQITMMOV == datasetshowRateiosCentrodeCusto.values[h].NSEQITMMOV) {
                retorno +=
                    ' <div class="row">\
        <div id="divRateioCCusto">\
          <input class="RateioCentroCusto1207" readonly value="' +
                    datasetshowRateiosCentrodeCusto.values[h]["NOMECENTRODECUSTO"] +
                    '">\
        </div>\
      </div>';
            }
        }
        retorno +=
            '</div>\
    <br>\
    <div class="divDepartamento1207 col-md-4"\
      <p>\
        <b style="padding-right:1.5rem"> Departamento: </b>\
      </p>';
        for (var k = 0; k < datasetshowRateiosDepatamento.values.length; k++) {
            if (DatasetShowItems.values[total].NSEQITMMOV == datasetshowRateiosDepatamento.values[k].NSEQITMMOV) {
                retorno +=
                    '<div class="row"\
        <div id="divRateioDepartamento">\
          <input class="Departamento1207" readonly value="' +
                    datasetshowRateiosDepatamento.values[k]["NOMEDEPARTAMENTO"] +
                    '">\
        </div>\
      </div>';
            }
        }
        retorno +=
            "</div >\
           </div >\
         </div >\
       </div >\
     </div >\
  </div>";
        numeracao++;
    }
    atualizarValorTotalFFCX();
    valorTotalRecebimento();
    return retorno;
}

var ordem = 0;

function enviaHistoricoCurtoData() {
    var fundoFixo = $("#fundoFixo").val();
    var filial = $("#selectFilial").val();
    var tipo = $("#tipo").val();
    var localDeEstoque = $("#ObraFiltro").val();

    var c1 = DatasetFactory.createConstraint("CODCFO", fundoFixo, fundoFixo, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("FILIAL", filial, filial, ConstraintType.SHOULD);
    var c3 = DatasetFactory.createConstraint("CODLOC", localDeEstoque, localDeEstoque, ConstraintType.MUST);

    if (tipo == "Fundo Fixo") {
        var c4 = DatasetFactory.createConstraint("OPERACAO", "SelectMov", "SelectMov", ConstraintType.MUST);
    } else if (tipo == "R.D.O") {
        var c4 = DatasetFactory.createConstraint("OPERACAO", "SelectMovRDO", "SelectMovRDO", ConstraintType.MUST);
    }
    var c5 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);

    var dsVerificaFundoFixo = DatasetFactory.getDataset("DatasetFFCXprod", null, [c1, c2, c3, c4, c5], null);
    dsFinal = dsVerificaFundoFixo.values;

    if (dsFinal.length > 0) {
        var motivoReembolso;
        if (tipo == "R.D.O") {
            motivoReembolso = dsFinal[0].HISTORICOCURTO;

            if (motivoReembolso === undefined || motivoReembolso === null || motivoReembolso === "---") {
                const isCorporativa = $("#corporativa").prop("checked");
                $("#corporativaDto").val(isCorporativa ? "sim" : "nao");
                $("#familiarDto").val(isCorporativa ? "nao" : "sim");
                motivoReembolso = isCorporativa ? "Viagem Corporativa" : "Viagem Familiar";
                $("#motivoReembolsoValue").val(motivoReembolso);
            }
            $("#motivoReembolsoDto").val(motivoReembolso);
        }
    }
}

function VerificaRetornoFundoFixo() {
    var fundoFixo = $("#fundoFixo").val();
    var filial = $("#selectFilial").val();
    var tipo = $("#tipo").val();
    var localDeEstoque = $("#ObraFiltro").val();

    var c1 = DatasetFactory.createConstraint("CODCFO", fundoFixo, fundoFixo, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("FILIAL", filial, filial, ConstraintType.SHOULD);
    var c3 = DatasetFactory.createConstraint("CODLOC", localDeEstoque, localDeEstoque, ConstraintType.MUST);

    if (tipo == "Fundo Fixo") {
        var c4 = DatasetFactory.createConstraint("OPERACAO", "SelectMov", "SelectMov", ConstraintType.MUST);
    } else if (tipo == "R.D.O") {
        var c4 = DatasetFactory.createConstraint("OPERACAO", "SelectMovRDO", "SelectMovRDO", ConstraintType.MUST);
    }
    var c5 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);

    var dsVerificaFundoFixo = DatasetFactory.getDataset("DatasetFFCXprod", null, [c1, c2, c3, c4, c5], null);
    dsFinal = dsVerificaFundoFixo.values;

    if (dsFinal.length > 0) {
        var latestItem = dsFinal.filter((item) => item.STATUS === "A").sort((a, b) => b.IDMOV - a.IDMOV)[0];
        if (latestItem) {
            var IdMovimento = latestItem.IDMOV;
            var NumeroMovimento = latestItem.NUMEROMOV;
            var motivoReembolso;

            if (tipo == "R.D.O") {
                motivoReembolso = latestItem.HISTORICOCURTO;

                console.log("valor de motivo reembolso: " + motivoReembolso);
            }

            var p1 = DatasetFactory.createConstraint("IDMOV", IdMovimento, IdMovimento, ConstraintType.MUST);
            var p2 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);

            //Itens:
            var p3 = DatasetFactory.createConstraint("OPERACAO", "SelectItem", "SelectItem", ConstraintType.MUST);
            var DatasetShowItems = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2, p3], null);
            dsFinalItems = DatasetShowItems.values;

            //Departamento:
            var p4 = DatasetFactory.createConstraint("OPERACAO", "ShowRateioDepartamento", "ShowRateioDepartamento;", ConstraintType.MUST);
            var DatasetShowRatDep = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2, p4], null);
            dsFinalRatDep = DatasetShowRatDep.values;

            //Centro de Custo:
            var p5 = DatasetFactory.createConstraint("OPERACAO", "ShowRateioCentroDeCusto", "ShowRateioCentroDeCusto", ConstraintType.MUST);
            var DatasetShowRatCC = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2, p5], null);
            dsFinalRatCC = DatasetShowRatCC.values;

            for (j = 0; j < dsFinalItems.length; j++) {
                valor = dsFinalRatDep[j].VALORRATEIO;
                valorItem = dsFinalItems[j].PRECOUNITARIO;

                ordem++;

                $("#tabItens").append(`
          <div class="panel panel-primary divItensProdutos" style="margin-top: 20px" id="divItensProdutos${ordem}">
              <div class="panel-heading" style="border: 1px solid #000; padding: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display: flex; align-items: center;">
                      <div class="details detailsShow"></div>
                      <div class="icon-green" id="icon-green${ordem}" onclick="MostraDivItem(${ordem})" style="margin-right: 10px;">+</div>
                      <div class="icon-red" id="icon-red${ordem}" onclick="MostraDivItem(${ordem})"><span>-</span></div>
                      <h3 class="panel-title countItem" style="margin: 0 10px;">Item ${ordem}</h3>
                  </div>
                  <div style="width: 70%; display: flex; flex-direction: column;">
                      <div style="display: flex; justify-content: space-between;">
                          <div style="width: 70%;">
                              <b>Fornecedor/Prestador: </b><p id="descricaoAtual${ordem}" style="display: inline;">${dsFinalItems[j].HISTORICOCURTO}</p>
                          </div>
                          <div style="width: 30%; text-align: left;">
                              <b>Quantidade:</b> <span id="quantidadeInput${ordem}"></span> UN
                          </div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                          <div style="width: 70%;">
                              <b>Valor Unitário:</b> <span id="valorUnit${ordem}">${FormataValorInserir(valorItem)}</span>
                          </div>
                          <div style="width: 30%; text-align: left;">
                              <b>Valor Total:</b> <input type="text" readonly class="valorTotal" id="valorTotal${ordem}" style="background: transparent; border: none; width: 50%;">
                          </div>
                      </div>
                  </div>
                  <div style="display: flex; justify-content: flex-end;">
                      <button class="btn btn-danger btnRemoverItem${ordem}" id="btnRemoverItem${ordem}" onclick="RemoveDivItem(${ordem})">
                          <i class="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
                      </button>
                  </div>
              </div>
              <div class="panel-body divCorpoTabela" id="divCorpoTabela${ordem}">
                  <div style="width: 100%;">
                      <div class="row">
                          <div class="col-md-6 col-lg-6">
                              <label class="labelFullWidth" style="width: 100%">Produto:
                                  <input name="ProdutoItem" readonly disabled id="produto${ordem}" type="text" class="form-control produto" value="${
                    dsFinalItems[j].NOMEFANTASIA
                }" />
                                  <input type="hidden" name="codigo" id="codigo" class="codigo" value="${dsFinalItems[j].CODIGOPRD}" />
                                  <input type="hidden" name="unidade" id="unidade" class="unidade" value="${dsFinalItems[j].UNIDADE}" />
                                  <input type="hidden" name="codigoProduto" id="codigoProduto" class="codigoProduto" value="${dsFinalItems[j].IDPRD}" />
                                  <input type="hidden" name="CodTb1Fat" id="CodTb1Fat" class="CodTb1Fat" value="${dsFinalItems[j].CODTB1FAT}" />
                              </label>
                              <br>
                          </div>

                          <div class="col-md-6 col-lg-6">
                              <div class="row">
                                  <div class="col-md-6">
                                      <label class="labelFullWidth" style="width: 100%">Quantidade:
                                          <div class="with-suffix" suffix="UN">
                                              <input type="text" class="form-control QuantidadeItem" oninput="AlteraQuantidade(this, ${ordem}); FormataNumeros(this); atualizarValorTotal(${ordem})" id="inputQuantidadeItem${ordem}" name="QuantidadeItem">
                                          </div>
                                      </label>
                                      <br>
                                  </div>
                                  <div class="col-md-6">
                                      <label class="labelFullWidth" style="width: 100%">Valor Unitário:
                                          <input type="text" readonly disabled name="ValorUnitItem" class="form-control ValorUnitItem" id="inputValorUnit${ordem}" oninput="atualizarValorTotal(${ordem})" placeholder="R$ 0,0000" value="${FormataValorInserir(
                    valorItem
                )}">
                                      </label>
                                      <br>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="row">
                      <div class="col-md-12">
                          <label class="labelFullWidth" style="width: 100%; margin-top: 10px">Prestador/Fornecedor:
                              <textarea name="fornecedor" readonly disabled class="form-control fornecedor" id="fornecedor${ordem}" oninput="AlteraDescricao(this, ${ordem})">${
                    dsFinalItems[j].HISTORICOCURTO
                }</textarea>
                          </label>
                          <br>
                      </div>
                      <div class="col-md-12">
                          <label class="labelFullWidth" style="width: 100%; margin-top: 10px">Centro de Custo:
                              <select class="form-control codCC" readonly disabled id="selectCentroDeCusto${ordem}" value="${dsFinalRatCC[j].CODCCUSTO} - ${
                    dsFinalRatCC[j].NOMECENTRODECUSTO
                }">
                                  <option value="${dsFinalRatCC[j].CODCCUSTO} - ${dsFinalRatCC[j].NOMECENTRODECUSTO}" readonly>${dsFinalRatCC[j].CODCCUSTO} - ${
                    dsFinalRatCC[j].NOMECENTRODECUSTO
                }</option>
                              </select>
                          </label>
                      </div>
                      <div class="col-md-12">
                          <label class="labelFullWidth departamentoDiv" style="width: 100%; margin-top: 10px">Departamento:
                              <select class="form-control departamento" readonly disabled id="departamentoHtml${ordem}" value="${
                    dsFinalRatDep[j].CODDEPARTAMENTO
                }">
                                  <option value="${dsFinalRatDep[j].CODDEPARTAMENTO}" readonly>${dsFinalRatDep[j].NOMEDEPARTAMENTO}</option>
                              </select>
                          </label>
                      </div>
                      </div>
                  </div>
              </div>
          </div>
        `);

                $("#IdMovimento").val(IdMovimento);
                $("#NumeroMovimento").val(NumeroMovimento);
                if ($("#inputQuantidadeItem" + ordem).val() === "" || $("#inputQuantidadeItem" + ordem).val() == undefined) {
                    $("#quantidadeInput" + ordem).text(1);
                    $("#inputQuantidadeItem" + ordem).val(1);
                    $("#valorTotal" + ordem).val(FormataValorInserir(valorItem));
                    $("#valorTotal" + ordem).text(FormataValorInserir(valorItem));
                    $("#inputQuantidadeItem" + ordem).prop("readonly", true);
                    $("#inputQuantidadeItem" + ordem).prop("disabled", true);
                }

                $("#inputQuantidadeItem" + ordem).prop("readonly", true);
                $("#inputQuantidadeItem" + ordem).prop("disabled", true);
                $("selectCentroDeCusto" + ordem).addClass("form-control");
                $("#icon-green" + ordem).hide();
                atualizarValorTotalFFCX();
            }
            $("#mensagemNenhumaItem").hide();
            if (tipo == "R.D.O") {
                $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
                $("#faturamentoDecisao").show();

                if (motivoReembolso === undefined || motivoReembolso === null || motivoReembolso === "---") {
                    const isCorporativa = true;

                    $("#corporativa").prop("checked", isCorporativa);
                    $("#motivoReembolsoDto").val("Viagem Corporativa");
                    $("#corporativaDto").val("sim");
                    $("#familiarDto").val("nao");
                    motivoReembolso = "Viagem Corporativa";
                    $("#motivoReembolsoValue").val(motivoReembolso);
                } else {
                    const isCorporativa = motivoReembolso === "Viagem Corporativa";

                    if ($("#corporativa").prop("checked") !== isCorporativa) {
                        $("#corporativa").prop("checked", isCorporativa);
                    }
                    if ($("#familiar").prop("checked") !== !isCorporativa) {
                        $("#familiar").prop("checked", !isCorporativa);
                    }
                }

                $("#motivoReembolsoDto").val(motivoReembolso);

                atualizarValorTotalFFCX();
            }
        }
    } else {
        $("#mensagemNenhumaItem").show();
        atualizarValorTotalFFCX();
        if (tipo == "R.D.O") {
            $("#motivoDiv, #motivoReembolsoTitulo, #motivoReembolsoValue").hide();
            $("#faturamentoDecisao").hide();
        }
    }
}

function AddDepartamentoHtml(selectId) {
    var filial = $("#selectFilial").val();

    if (filial != 0 && filial != "" && filial != null) {
        var constraints = [
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", filial, filial, ConstraintType.MUST),
        ];

        var wsReport = DatasetFactory.getDataset("DepartamentosRM", null, constraints, null);

        if (wsReport && wsReport.values.length > 0) {
            $("#" + selectId).empty();

            $("#" + selectId).append(
                $("<option>", {
                    value: "",
                    text: "",
                })
            );

            for (var i = 0; i < wsReport.values.length; i++) {
                var coddepartamento = wsReport.values[i].coddepartamento;
                var nome = wsReport.values[i].nome;
                var optionText = coddepartamento + " - " + nome;

                var option = $("<option>", {
                    value: coddepartamento,
                    text: optionText,
                });

                $("#" + selectId).append(option);
            }

            $("#" + selectId).val("");
            // $("#" + selectId).val(wsReport.values[0].coddepartamento);
        }
    }
}

function atualizarValorTotal(ordem) {
    const quantidadeElement = document.getElementById("QuantidadeItemEdicao" + ordem);
    const valorUnitarioElement = document.getElementById("inputValorUnitEdicao" + ordem);

    if (quantidadeElement && valorUnitarioElement) {
        const quantidade = parseFloat(quantidadeElement.value.replace(",", ".")) || 0;
        const valorUnitario = parseFloat(valorUnitarioElement.value.replace(".", "").replace(",", ".")) || 0;

        const valorTotal = quantidade * valorUnitario;
        const valorTotalElement = document.getElementById("valorTotal" + ordem);

        if (valorTotalElement) {
            valorTotalElement.value = valorTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        }
    } else {
        console.error("Não foi possível encontrar os elementos de quantidade ou valor unitário.");
    }
}

function procuraProdutos(ordem) {
    var callback = {
        success: function (dataset) {
            ListProdutos = dataset.values;

            var nomeFantasia = $("#produto" + ordem).val();
            for (i = 0; i < ListProdutos.length; i++) {
                if (ListProdutos[i].NOMEFANTASIA == nomeFantasia) {
                    $("#produtosInfo" + ordem)
                        .closest("#divInfoProdutos" + ordem)
                        .find("#codigo" + ordem)
                        .val(ListProdutos[i].CODIGOPRD);
                    $("#produtosInfo" + ordem)
                        .closest("#divInfoProdutos" + ordem)
                        .find("#CodTb1Fat" + ordem)
                        .val(ListProdutos[i].CODTB1FAT);
                    $("#produtosInfo" + ordem)
                        .closest("#divInfoProdutos" + ordem)
                        .find("#unidade" + ordem)
                        .val(ListProdutos[i].UNIDADE);
                    $("#produtosInfo" + ordem)
                        .closest("#divInfoProdutos" + ordem)
                        .find("#codigoProduto" + ordem)
                        .val(ListProdutos[i].IDPRD);
                }
            }
            if (
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#produto" + ordem)
                    .val() === "30.998.00015" ||
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#produto" + ordem)
                    .val() === "30.998.00045" ||
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#produto" + ordem)
                    .val() === "30.998.00046" ||
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#produto" + ordem)
                    .val() === "30.998.00047" ||
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#produto" + ordem)
                    .val() === "30.998.00048" ||
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#produto" + ordem)
                    .val() === "40.001.00001"
            ) {
                alert("Produto Inválido. Favor selecionar outro.");
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#codigoProduto" + ordem)
                    .val("");
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#CodTb1Fat" + ordem)
                    .val("");
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#unidade" + ordem)
                    .val("");
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find("#codigo" + ordem)
                    .val("");
                $("#produtosInfo" + ordem)
                    .closest("#divInfoProdutos" + ordem)
                    .find($('[data-role="remove"]'))
                    .click();
            }
        },
        error: function (error) {},
    };
    var p1 = DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val(), $("#coligada").val(), ConstraintType.MUST);
    var p2 = DatasetFactory.createConstraint("OPERACAO", "buscaProdutosPorColigada", "buscaProdutosPorColigada", ConstraintType.MUST);
    DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null, callback);
}

function VerificaCondicaoAprovacao() {
    var c1 = DatasetFactory.createConstraint("CODCFO", $("#masterValueFCFO").val(), $("#masterValueFCFO").val(), ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("OPERACAO", "VerificaAprovacaoFundoFixo", "VerificaAprovacaoFundoFixo", ConstraintType.MUST);
    var dsVerificaFundoFixo = DatasetFactory.getDataset("DatasetFFCXprod", null, [c1, c2], null);
    $("#valorCampoComplemento").val(dsVerificaFundoFixo.values[0].VALIDAFF);
}

function verificaLocalDeEstoqueMov() {
    var p1 = DatasetFactory.createConstraint("CCUSTO", $("#selectLocalEstoque").val(), $("#selectLocalEstoque").val(), ConstraintType.MUST);
    var p2 = DatasetFactory.createConstraint("OPERACAO", "buscaLocalDeEstoquePorCentroDeCusto", "buscaLocalDeEstoquePorCentroDeCusto", ConstraintType.MUST);
    var datasetLocalMov = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null);
    for (i = 0; i < datasetLocalMov.values.length; i++) {
        if (datasetLocalMov.values[i].CODFILIAL == $("#selectFilial").val()) {
            $("#codLocalEstoqueMov").val(datasetLocalMov.values[i].CODLOC);
        }
    }
}

function getCommonJson(element) {
    var codCCValue = element.find(".codCC").val();
    var codCCSplit = codCCValue.split(" - ")[0];

    return {
        fundoFixo: $(".fundoFixo").val(),
        dataAtual: $(".DatadeHoje").val(),
        formaDePagto: $("#campoformaPagamentoDto").val(),
        localDeEstoque: $("#codLocalEstoqueMov").val(),
        filial: $(".filial").val(),
        fornecedor: element.find(".fornecedor").val().trim(),
        nomeFantasia: element.find(".produto").val(),
        idProduto: element.find(".codigo").val(),
        codigoProduto: element.find(".codigoProduto").val(),
        unidade: element.find(".unidade").val(),
        codTb1Fat: element.find(".CodTb1Fat").val(),
        codCC: codCCValue ? codCCValue.split(" - ")[0] : null,
        valor: element.find(".valorTotal").val(),
        valorUnitario: element.find(".ValorUnitItem").val(),
        quantidade: element.find(".QuantidadeItem").val(),
        depart: getDepartamentos(element, codCCSplit),
    };
}

function getDepartamentos(element, codCCSplit) {
    var departamentos = [];
    element.find(".departamentoDiv").each(function () {
        departamentos.push({
            valorDepartamento: $(element).find(".valorTotal").val(),
            departamento: $(element).find(".departamento").val().split(" - ")[0],
        });
    });
    return departamentos;
}

function handleProvisao() {
    var listJson = [];
    $(".divItensProdutos").each(function () {
        var json = getCommonJson($(this));
        listJson.push(json);
    });
    $("#codList").val(JSON.stringify(listJson));
}

function handleRecebimento() {
    var listJsonAprov = [];
    if ($("#formMode").val() == "ADD") {
        var p1 = DatasetFactory.createConstraint("IDMOV", $("#NumeroMovimento").val(), $("#NumeroMovimento").val(), ConstraintType.MUST);
        var p2 = DatasetFactory.createConstraint("OPERACAO", "SelectItem", "SelectItem", ConstraintType.MUST);
        var DatasetDadosMovAprov = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null);

        $(".divFatItem").each(function () {
            if ($(this).find(".CheckFatItem").prop("checked")) {
                var json = {
                    values: DatasetDadosMovAprov.values[$(this).find(".ValNum").val() - 1],
                };
                listJsonAprov.push(json);
            } else {
                $(this).find(".CheckFatItem").attr("id", "notChecked");
            }
        });

        $("#DataEmail").val(getDataHoje("DD/MM/AAAA"));
        $("#valuesRecebimento").val(JSON.stringify(listJsonAprov));
    } else {
        // Comentado o Código pois a função getCommonJson dava erro quando executada na aprovação da Contabilidade com os Itens do Movimento Abertos
        // Devido a alguns campos do getCommonJson não existirem no Recebimento
        // E o campo "#codList" só é usado para a Provisão, então não afeta o Recebimento
        // $(".divItensProdutos").each(function () {
        //     var json = getCommonJson($(this));
        //     listJsonAprov.push(json);
        // });
        // $("#codList").val(JSON.stringify(listJsonAprov));
    }
}

function handleAprovEngenheiro() {
    if (!$("#decisaoAprovar").prop("checked") && !$("#decisaoCancelar").prop("checked")) {
        return false;
    }

    if ($("#decisaoAprovar").prop("checked")) {
        listJson1207 = [];
        var tipo = $("#tipo").val();

        $("#tabelaDeRecebimentos_wrapper tbody tr").each(function () {
            var p1 = DatasetFactory.createConstraint("IDMOV", $(this).find(".Idmov1207").val(), $(this).find(".Idmov1207").val(), ConstraintType.MUST);

            if (tipo == "Fundo Fixo") {
                var p2 = DatasetFactory.createConstraint("OPERACAO", "GeraXML1207", "GeraXML1207", ConstraintType.MUST);
            } else if (tipo == "R.D.O") {
                var p2 = DatasetFactory.createConstraint("OPERACAO", "GeraXMLRDO", "GeraXMLRDO", ConstraintType.MUST);
            }

            var DatasetDadosMov1207 = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null);

            for (k = 0; k < DatasetDadosMov1207.values.length; k++) {
                var json = {
                    values: DatasetDadosMov1207.values[k],
                };
                var convertido1207 = json;
                listJson1207.push(convertido1207);
            }
        });

        $("#DataEmail").val(getDataHoje("DD/MM/AAAA"));
        $("#valuesRecebimento").val(JSON.stringify(listJson1207));
    } else {
        // var qtdAnexos = parent.ECM.attachmentTable.getData().length;
        // for (d = 0; d < qtdAnexos; d++) {
        //   parent.WKFViewAttachment.removeAttach([0]);
        // }

        $("#DataEmail").val(getDataHoje("DD/MM/AAAA"));
    }
}

function handleAprovContabilidade() {
    if ($("#decisaoAprovar").prop("checked")) {
        var listJson1207 = [];
        var tipo = $("#tipo").val();
        $("#tabelaDeRecebimentos_wrapper tbody tr").each(function () {
            var p1 = DatasetFactory.createConstraint("IDMOV", $(this).find(".Idmov1207").val(), $(this).find(".Idmov1207").val(), ConstraintType.MUST);

            if (tipo === "Fundo Fixo") {
                var p2 = DatasetFactory.createConstraint("OPERACAO", "GeraXML1207", "GeraXML1207", ConstraintType.MUST);
            } else if (tipo == "R.D.O") {
                var p2 = DatasetFactory.createConstraint("OPERACAO", "GeraXMLRDO", "GeraXMLRDO", ConstraintType.MUST);
            }

            var DatasetDadosMov1207 = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null);
            for (k = 0; k < DatasetDadosMov1207.values.length; k++) {
                var json = {
                    values: DatasetDadosMov1207.values[k],
                };
                var convertido1207 = json;
                listJson1207.push(convertido1207);
            }
        });

        $("#DataEmail").val(getDataHoje("DD/MM/AAAA"));
        $("#valuesRecebimento").val(JSON.stringify(listJson1207));
    } else {
        // var qtdAnexos = parent.ECM.attachmentTable.getData().length;

        // for (d = 0; d < qtdAnexos; d++) {
        //   parent.WKFViewAttachment.removeAttach([0]);
        // }

        $("#DataEmail").val(getDataHoje("DD/MM/AAAA"));
    }
}

function atualizarOptions() {
    var tipo = $("#tipo").val();

    const selectElement = document.getElementById("condicaoPagamento");

    if (tipo === "R.D.O") {
        selectElement.innerHTML = `
          <option value=""></option>
          <option value="005rd">3 DIAS - JANELA PGTO DIA 05</option>
          <option value="015rd">3 DIAS - JANELA PGTO DIA 15</option>
          <option value="025rd">3 DIAS - JANELA PGTO DIA 25</option>
      `;
    } else if (tipo === "Fundo Fixo") {
        selectElement.innerHTML = `
          <option value=""></option>
          <option value="008cx">3 DIAS - JANELA PGTO DIA 08</option>
          <option value="018cx">3 DIAS - JANELA PGTO DIA 18</option>
          <option value="028cx">3 DIAS - JANELA PGTO DIA 28</option>
      `;
    }
}

function clickInTheItens() {
    if ($("#modalidade").val() == "Recebimento") {
        if ($("#formaPagamento").val() != "" && $("#condicaoPagamento").val() != "") {
            $("#atabItens").click();
            $("#divbtnAddItens, #mensagemNenhumaItem, .divItensProdutos, .divNovosItens").hide();

            var formaPagamento = $("#formaPagamento").val().trim();
            var condicaoPagamento = $("#condicaoPagamento").val().trim();

            if (formaPagamento === "") {
                $("#formaPagamento").css("border", "1px solid red");
                FLUIGC.toast({
                    title: "",
                    message: "Preencha o campo Forma de Pagamento",
                    type: "warning",
                });
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }

            if (condicaoPagamento === "") {
                $("#condicaoPagamento").css("border", "1px solid red");
                FLUIGC.toast({
                    title: "",
                    message: "Preencha o campo Condição de Pagamento",
                    type: "warning",
                });
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }
            $(this).attr("href", "#divTabelaDeRecebimentos");
            $("#divTabelaDeRecebimentos").show();

            if ($("#tipo").val() == "Fundo Fixo") {
                $("#titleFundoSelecionado").text("Fundo Fixo:");
                var fundoFixo = $("#fundoFixo").val();
                var numeros = fundoFixo.match(/\d+/);
                if (numeros !== null && numeros.length > 0) {
                    var fundoFixoSemCodigo = numeros[0];
                    $("#fundoSelecionado").text(fundoFixoSemCodigo);
                } else {
                    $("#fundoSelecionado").text("Nenhum número encontrado");
                }
            } else if ($("#tipo").val() == "R.D.O") {
                if ($("#modalidade").val() == "Recebimento") {
                    $("#divValorTotal, #titleValorTotal, #valorTotalFFCX").hide();
                }
                $("#titleFundoSelecionado").text("Reembolso de Despesas da Obra (R.D.O):");
                var fundoFixo = $("#fundoFixo").val();
                var numeros = fundoFixo.match(/\d+/);
                if (numeros !== null && numeros.length > 0) {
                    var fundoFixoSemCodigo = numeros[0];
                    $("#fundoSelecionado").text(fundoFixoSemCodigo);
                } else {
                    $("#fundoSelecionado").text("Nenhum número encontrado");
                }
            }

            var tabela = $("#tabelaDeRecebimentos");

            if ($.fn.DataTable.isDataTable("#tabelaDeRecebimentos")) {
                tabela.DataTable().clear().draw();
                $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                    var tr = $(this).closest("tr");
                    var row = tabela.DataTable().row(tr);

                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass("shown");
                    } else {
                        row.child(format(row.data())).show();
                        tr.addClass("shown");
                    }
                });
                preencheTabelaReceber();
                return;
            } else {
                tabela.DataTable({
                    columns: [
                        {
                            className: "details-control",
                            align: "justified",
                            orderable: false,
                            data: null,
                            defaultContent: "",
                            targets: 1,
                            responsive: true,
                            render: function (data, type, row) {
                                return "<span></span>";
                            },
                        },
                        {
                            data: "IDMOV",
                            render: function (data, type, row) {
                                return "<input class='Idmov1207' readonly style='border: 0' value='" + data + "'>";
                            },
                        },
                        {
                            data: "NOMECENTRODECUSTO",
                            render: function (data, type, row) {
                                return "<input class='CentroDeCusto1207' readonly style='border: 0' value='" + data + "'>";
                            },
                        },
                        {
                            data: "VALORBRUTO",
                            render: function (data, type, row) {
                                return "<input class='ValorMov1207' readonly style='border: 0;' readonly value='" + FormataValor(data) + "'>";
                            },
                        },
                    ],
                    language: {
                        url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json",
                    },
                });

                $("#tabelaDeRecebimentos tbody").on("click", "td.details-control", function () {
                    var tr = $(this).closest("tr");
                    var row = tabela.DataTable().row(tr);

                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass("shown");
                    } else {
                        row.child(format(row.data())).show();
                        tr.addClass("shown");
                    }
                });
                preencheTabelaReceber();
                ShowTotalValue();
            }
        }
    }
    return;
}

function atribuiValorCheckbox() {
    var aprovacao = document.getElementById("decisaoAprovar").checked ? "sim" : "nao";
    var cancelamento = document.getElementById("decisaoCancelar").checked ? "sim" : "nao";

    if (aprovacao === "sim") {
        document.getElementById("decisaoCancelar").checked = false;
        cancelamento = "nao";
    }

    if (cancelamento === "sim") {
        document.getElementById("decisaoAprovar").checked = false;
        aprovacao = "nao";
    }

    $("#aprovacao, #aprovacaoContabilidade").val(aprovacao);
    $("#cancelamento, #cancelamentoContabilidade").val(cancelamento);
}

function atribuiValorDataFaturamento() {
    var aprovacao = document.getElementById("decisaoFaturamentoSim");
    var cancelamento = document.getElementById("decisaoFaturamentoNao");

    if (aprovacao.checked) {
        cancelamento.checked = false;
    } else if (cancelamento.checked) {
        aprovacao.checked = false;
    }

    if (aprovacao.checked) {
        $("#dataFaturamento").show();
    } else {
        $("#dataFaturamento").hide();
    }

    $("#decisaoFaturamentoSim").val(aprovacao.checked ? "sim" : "nao");
    $("#decisaoFaturamentoNao").val(cancelamento.checked ? "sim" : "nao");
}

function setaTipoFundoFixo() {
    var coligada = $("#coligada").val()
    if (coligada == 2) {
        const selectElement = document.getElementById("tipo");
        const optionRDO = selectElement.querySelector('option[value="R.D.O"]');
        const optionFundoFixo = selectElement.querySelector('option[value="Fundo Fixo"]');

        if (optionRDO) {
            optionRDO.remove();
        }

        if (optionFundoFixo && selectElement.options.length === 1) {
            const newOption = document.createElement("option");
            newOption.value = "R.D.O";
            newOption.text = "R.D.O";
            selectElement.appendChild(newOption);
        }
    } 
    else if(coligada == 6){
        $("#tipo").html("<option></option><option value='R.D.O'>R.D.O</option>")
    }
    else {
        const selectElement = document.getElementById("tipo");
        const optionRDO = selectElement.querySelector('option[value="R.D.O"]');

        if (!optionRDO) {
            const newOption = document.createElement("option");
            newOption.value = "R.D.O";
            newOption.text = "R.D.O";
            selectElement.appendChild(newOption);
        }
    }
}

function atribuicaoEngCoord() {
    var coord = null;
    var eng = null;
    const select = document.getElementById("selectLocalEstoque");
    const selectedText = select.options[select.selectedIndex].text;

    if ($("#coligada").val() == 1 && selectedText == "Matriz Curitiba") {
        $("#engenheiro").val(1);
        return;
    }

    if ($("#coligada").val() == 5) {
        $("#engenheiro").val(1);
        return;
    }
    DatasetFactory.getDataset(
        "verificaAprovador",
        null,
        [
            DatasetFactory.createConstraint("paramCodcoligada", $("#hiddenCodColigada").val(), $("#hiddenCodColigada").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("paramLocal", $("#hiddenObra").val(), $("#hiddenObra").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("paramCodTmv", "1.1.98", "1.1.98", ConstraintType.MUST),
            DatasetFactory.createConstraint("paramValorTotal", 1001, 1001, ConstraintType.MUST),
        ],
        null,
        {
            success: (UsuariosComPermissaoDeAprovacao) => {
                for (const Aprovador of UsuariosComPermissaoDeAprovacao.values) {
                    if (Aprovador.limite > 1000 && Aprovador.limite <= 20000) {
                        //Eng
                        var SeAprovadorTemPapelAprovaContratos = DatasetFactory.getDataset(
                            "workflowColleagueRole",
                            null,
                            [
                                DatasetFactory.createConstraint(
                                    "workflowColleagueRolePK.colleagueId",
                                    Aprovador.usuarioFLUIG,
                                    Aprovador.usuarioFLUIG,
                                    ConstraintType.MUST
                                ),
                                DatasetFactory.createConstraint("workflowColleagueRolePK.roleId", "aprovaContratos", "aprovaContratos", ConstraintType.MUST),
                            ],
                            null
                        );
                        if (SeAprovadorTemPapelAprovaContratos.values.length > 0) {
                            //Se o nomeusu for igual ao Engenheiro Aprovador significa que o proprio engenheiro está solicitantando, entao nao precisa passar pela aprovacao dele
                            if (Aprovador.usuarioFLUIG == $("#nomeusu").val()) {
                                eng = 1;
                            } else {
                                eng = Aprovador.usuarioFLUIG;
                            }
                        }
                    } else if (Aprovador.limite > 20000 && Aprovador.limite <= 250000) {
                        //Coord
                        var SeAprovadorTemPapelAprovaContratos = DatasetFactory.getDataset(
                            "workflowColleagueRole",
                            null,
                            [
                                DatasetFactory.createConstraint(
                                    "workflowColleagueRolePK.colleagueId",
                                    Aprovador.usuarioFLUIG,
                                    Aprovador.usuarioFLUIG,
                                    ConstraintType.MUST
                                ),
                                DatasetFactory.createConstraint("workflowColleagueRolePK.roleId", "aprovaContratos", "aprovaContratos", ConstraintType.MUST),
                            ],
                            null
                        );

                        if (SeAprovadorTemPapelAprovaContratos.values.length > 0) {
                            coord = Aprovador.usuarioFLUIG;
                        }
                    }
                }

                if (eng != null) {
                    $("#engenheiro").val(eng);
                }
                if (coord != null) {
                    $("#coordenador").val(coord);
                }
            },
        }
    );
}

function carregaItensProvisaoModoView() {
    var itens = $("#codList").val();
    if (itens.trim() == "") {
        console.error("Nenhum item encontrado no campo codList");
        throw "Nenhum item encontrado no campo codList";
    }

    try {
        itens = JSON.parse(itens);
    } catch (error) {
        console.error("Não foi possível extrair o JSON do campo codList");
        throw "Não foi possível extrair o JSON do campo codList";
    }

    var html = "";
    var counter = 1;
    for (const item of itens) {
        html += `<div class="panel panel-primary divItensProdutos" style="margin-top: 20px" id="divItensProdutos${ordem}">
            ${htmlHeader(counter, item)}
            ${htmlBody(counter, item)}
        </div>`;
        counter++;
    }

    $("#tabItens").html(html);
    $("[id^='icon-green']").hide();

    function htmlHeader(ordem, item) {
        var html = `<div class="panel-heading" style="border: 1px solid #000; padding: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="width: 15%; display: flex; align-items: center;">
                <div class="details detailsShow"></div>
                <div class="icon-green" id="icon-green${ordem}" onclick="MostraDivItem(${ordem})" style="margin-right: 10px;">+</div>
                <div class="icon-red" id="icon-red${ordem}" onclick="MostraDivItem(${ordem})"><span>-</span></div>
                <h3 class="panel-title countItem" style="margin: 0 10px;">Item ${ordem}</h3>
            </div>
            <div style="width: 70%; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between;">
                    <div style="width: 70%;">
                        <b>Fornecedor/Prestador: </b><p id="descricaoAtual${ordem}" style="display: inline;">${item.fornecedor}</p>
                    </div>
                    <div style="width: 30%; text-align: left;">
                        <b>Quantidade:</b> <span id="inputQuantidadeItem${ordem}">${item.quantidade}</span> UN 
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <div style="width: 70%;">
                        <b>Valor Unitário:</b> <span id="valorUnitEdicao${ordem}">${item.valorUnitario}</span>
                    </div>
                    <div style="width: 30%; text-align: left;">
                        <b>Valor Total:</b> <input type="text" readonly class="valorTotal" id="valorTotal${ordem}" value="${item.valor}" style="background: transparent; border: none; width: 50%;">
                    </div>
                </div>
            </div>
             <div style="width: 15%; display: flex; justify-content: flex-end;">
                <button class="btn btn-danger btnRemoverItem${ordem} btnRemoverItem" id="btnRemoverItem${ordem}" onclick="RemoveDivItem(${ordem})">
                    <i class="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
                </button>
            </div>
        </div>`;

        return html;
    }
    function htmlBody(ordem, item) {
        var html = `<div class="panel-body divCorpoTabela" id="divCorpoTabela${ordem}">
            <div id="tabInformacoesProduto${ordem}" style="width: 100%">
                <div class="row">
                    <div class="col-md-6 col-lg-6">
                        <label class="labelFullWidth" style="width: 100%"
                            >Produto:
                            <input name="ProdutoItem" type="text" class="form-control produto" readonly id="produto${ordem}" value="${item.nomeFantasia}" />
                        </label>
                        <br />
                    </div>
                    <div class="col-md-6 col-lg-6" id="divInfoProdutos${ordem}">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="labelFullWidth" style="width: 100%"
                                    >Quantidade:
                                    <div class="with-suffix" suffix="UN">
                                        <input
                                            type="text"
                                            readonly
                                            class="form-control QuantidadeItem"
                                            id="QuantidadeItemEdicao${ordem}"
                                            oninput="AlteraQuantidadeEdicao(this, ${ordem}); atualizarValorTotal(${ordem}); atualizarValorTotalFFCX();"
                                            id="inputQuantidadeItem${ordem}"
                                            name="QuantidadeItem"
                                            value="${item.quantidade}"
                                        />
                                    </div>
                                </label>
                                <br />
                            </div>
                            <div class="col-md-6" id="produtosInfo${ordem}">
                                <label class="labelFullWidth" style="width: 100%"
                                    >Valor Unitário:
                                    <input
                                        type="text"
                                        name="ValorUnitItem"
                                        readonly
                                        class="form-control ValorUnitItem"
                                        value="${item.valorUnitario}"
                                        id="inputValorUnitEdicao${ordem}"
                                        oninput="FormataNumeros(this); atualizarValorTotalFFCX(); atualizarValorTotal(${ordem}); 
                                                            ${FormataValorInserir(this.val)}; AtualizaValorCampoValorUnitEdicao(${ordem})"
                                    />
                                </label>
                                <br />
                                <input type="hidden" name="codigo" id="codigo${ordem}" class="codigo" />
                                <input type="hidden" name="unidade" id="unidade${ordem}" class="unidade" />
                                <input type="hidden" name="codigoProduto" id="codigoProduto${ordem}" class="codigoProduto" />
                                <input type="hidden" name="CodTb1Fat" id="CodTb1Fat${ordem}" class="CodTb1Fat" />
                            </div>
                        </div>
                    </div>
                    <div class="col-md-12" style="margin-top: 10px">
                        <label class="labelFullWidth" style="width: 100%"
                            >Prestador/Fornecedor:
                            <textarea
                                name="fornecedor"
                                type="text"
                                readonly
                                oninput="AlteraDescricao(this, ${ordem})"
                                class="form-control fornecedor"
                                id="fornecedor"
                                value=""
                            >${item.fornecedor}</textarea>
                        </label>
                        <br />
                    </div>
                    <div class="col-md-6" style="margin-top: 10px">
                        <label class="labelFullWidth" style="width: 100%"
                            >Centro de Custo:
                            <select class="form-control codCC" id="selectCentroDeCustoEdicao${ordem}" readonly value="${
            item.codCC
        }" style="width: 100%; height: 32px">
                                <option selected>${item.codCC}</option>
                            </select>
                        </label>
                    </div>
                    <div class="col-md-6 departamentoDiv" style="margin-top: 10px">
                        <label class="labelFullWidth" style="width: 100%"
                            >Departamento:
                            <select class="form-control departamento" id="departamentoHtmlEdicao${ordem}" readonly style="width: 100%; height: 32px">
                                <option selected>${item.depart[0].departamento}</option>
                            </select>
                        </label>
                    </div>
                </div>
                <br />
            </div>
        </div>`;
        return html;
    }
}

// Validate
function validateJsonInfos() {
    var tipo = $("#tipo").val();
    var atividadeDto = activity;
    enviaHistoricoCurtoData();

    if ($("#campoFundoFixoDto").val() == "000557") {
        atividadeDto = 6;
        $("#aprovacao").val("sim");
    }

    try {
        if (atividadeDto == ATIVIDADES.APROVACAO_CONTABILIDADE) {
            if ($("#aprovacao").val() == "sim") {
                listJson1207 = [];
                $("#tabelaDeRecebimentos tbody tr").each(function () {
                    var p1 = DatasetFactory.createConstraint("IDMOV", $(this).find(".Idmov1207").val(), $(this).find(".Idmov1207").val(), ConstraintType.MUST);
                    if (tipo == "Fundo Fixo") {
                        p2 = DatasetFactory.createConstraint("OPERACAO", "GeraXML1207", "GeraXML1207", ConstraintType.MUST);
                    } else if (tipo == "R.D.O") {
                        p2 = DatasetFactory.createConstraint("OPERACAO", "GeraXMLRDO", "GeraXMLRDO", ConstraintType.MUST);
                    }
                    var DatasetDadosMov1207 = DatasetFactory.getDataset("DatasetFFCXprod", null, [p1, p2], null);
                    for (k = 0; k < DatasetDadosMov1207.values.length; k++) {
                        var json = {
                            values: DatasetDadosMov1207.values[k],
                        };
                        var convertido1207 = json;
                        listJson1207.push(convertido1207);
                    }
                });

                $("#DataEmail").val(getDataHoje("DD/MM/AAAA"));
                // A condição (atividadeDto == ATIVIDADES.APROVACAO_CONTABILIDADE) somente será verdadeira para o Recebimento
                // Pois a Provisão é encerrada logo após o Inicio, sem passar pela Aprovação Contabilidade
                // Sendo assim, é errado chamar o handleProvisao para o Recebimento
                // E essa chamada estava dando erro quando os Itens do Movimento estava expandidos, pois a função não encontrava os campos necessários
                // handleProvisao();
                $("#valuesRecebimento").val(JSON.stringify(listJson1207));

                if ($("#campoFundoFixoDto").val() != "000557") {
                    if (!$("#decisaoFaturamentoSim").prop("checked") && !$("#decisaoFaturamentoNao").prop("checked")) {
                        FLUIGC.toast({
                            message: "Selecione uma opção",
                            type: "warning",
                        });
                        $("label[for='decisaoFaturamentoSim'], label[for='decisaoFaturamentoNao']").css("border", "1px solid red");
                        return false;
                    } else {
                        $("label[for='decisaoFaturamentoSim'], label[for='decisaoFaturamentoNao']").css("border", "");
                    }
                }
            } else {
                // var qtdAnexos = parent.ECM.attachmentTable.getData().length;
                // for (d = 0; d < qtdAnexos; d++) {
                //   parent.WKFViewAttachment.removeAttach([0]);
                // }

                $("#DataEmailRetorno").val(getDataHoje("DD/MM/AAAA"));
            }
        }

        if (atividadeDto == 0) {
            if ($("#modalidade").val() == "Recebimento") {
                if ($(".CentroDeCusto1207").length === 0) {
                    FLUIGC.toast({
                        message: "Não é possível incluir movimento sem itens",
                        type: "warning",
                    });
                    return false;
                }
                if ($(".divItensProdutos").is(":visible")) {
                    $(".details-control").click();
                }
                const select = document.getElementById("formaPagamento");
                const selectedOption = select.options[select.selectedIndex];
                const textoSelecionado = selectedOption.text;
                $("#formaDePagamentoPlaceHolder").val(textoSelecionado);
                handleRecebimento();
                return true;
            }
        }

        if ($("#modalidade").val() == "Provisao") {
            if ($("#tipo").val() == "R.D.O") {
                $(".codCC").each(function (index) {
                    let itemNumber = $(this).closest(".panel").find(".countItem").text().trim();

                    if ($(this).val().trim() === "") {
                        showErrorMessage("Centro de Custo", itemNumber);
                        return false;
                    }
                });

                if (!validateCamposProvisao()) {
                    return false;
                }
                handleProvisao();
                ChecaBotoes();

                if (!$("#familiar").is(":checked") && !$("#corporativa").is(":checked")) {
                    FLUIGC.toast({
                        message: "Selecione o Motivo do Reembolso de Despesa!",
                        type: "warning",
                    });
                    return false;
                }

                if (document.querySelectorAll(".divNovosItens").length === 0 && $(".divItensProdutos").length === 0) {
                    FLUIGC.toast({
                        message: "Insira pelo menos um item!",
                        type: "warning",
                    });
                    return false;
                } else {
                    return true;
                }
            } else {
                handleProvisao();
            }
        }

        if ($("#modalidade").val() == "Recebimento") {
            if ($("#tipo").val() == "R.D.O") {
                if (!$("#motivoReembolsoTitulo").is(":visible")) {
                    if (!$("#familiar").prop("checked") && !$("#corporativa").prop("checked") && (atividadeDto == ATIVIDADES.INICIO || atividadeDto == ATIVIDADES.INICIO_0 )) {
                        FLUIGC.toast({
                            message: "Escolha o motivo do reembolso da despesa!",
                            type: "warning",
                        });
                        $("#familiar, #corporativa").css("border", "1px solid red");
                        return false;
                    } else {
                        $("#familiar, #corporativa").css("border", "");
                    }
                    ChecaBotoes();
                }
            }
        }

        return true;
    } catch (err) {
        console.log("error: " + err);
        return false;
    }
}
function validateCamposProvisao() {
    let isValid = true;

    $(".QuantidadeItem").each(function (index) {
        let itemNumber = $(this).closest(".panel").find(".countItem").text().trim();

        if ($(this).val().trim() === "") {
            isValid = false;
            showErrorMessage("Quantidade", itemNumber);
            return false;
        }
    });

    $(".ValorUnitItem").each(function (index) {
        let itemNumber = $(this).closest(".panel").find(".countItem").text().trim();

        if ($(this).val().trim() === "") {
            isValid = false;
            showErrorMessage("Valor Unit", itemNumber);
            return false;
        }
    });

    $(".fornecedor").each(function (index) {
        let itemNumber = $(this).closest(".panel").find(".countItem").text().trim();

        if ($(this).val().trim() === "") {
            isValid = false;
            showErrorMessage("Prestador/Fornecedor", itemNumber);
            return false;
        }
    });

    $(".departamento").each(function (index) {
        let itemNumber = $(this).closest(".panel").find(".countItem").text().trim();

        if ($(this).val().trim() === "") {
            isValid = false;
            showErrorMessage("Departamento", itemNumber);
            return false;
        }
    });

    return isValid;
}

// Utils
function showErrorMessage(fieldName, itemNumber) {
    FLUIGC.toast({
        title: "",
        message: `Preencha o campo "${fieldName}" do ${itemNumber}`,
        type: "warning",
    });
}
function FormataValor(valor) {
    var numero = parseFloat(valor);
    numero = numero.toFixed(2).split(".");
    numero[0] = "R$" + numero[0].split(/(?=(?:...)*$)/).join(".");
    return numero.join(",");
}
function FormataValorParaMoeda(element, decimais, reais = true) {
    let valor = $(element)
        .val()
        .replace(/[^0-9,.]/g, "");

    if (isNaN(valor)) {
        return " - ";
    }

    if (valor) {
        valor = parseFloat(valor.replace(",", "."));
    }

    if (isNaN(decimais)) {
        decimais = 6;
    }

    $(element).val(
        (reais ? "R$ " : "") +
            valor.toLocaleString("pt-br", {
                minimumFractionDigits: decimais,
                maximumFractionDigits: decimais,
            })
    );
}
function removeDivsByClass(className) {
    const divs = document.querySelectorAll("div." + className);
    for (let i = 0; i < divs.length; i++) {
        divs[i].parentNode.removeChild(divs[i]);
    }
}
function formatarValor(input) {
    var valor = input.value.replace(/\D/g, "");
    valor = (valor / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
    input.value = valor;
}
function formatarPercentual(input) {
    input.value = input.value.replace(/\D/g, "") + "%";
}
function FormataValorInserir(valor) {
    if (!valor) {
        valor = "0";
    }

    var numero = parseFloat(valor.replace(/[^\d.-]/g, "").replace(",", "."));
    if (isNaN(numero)) numero = 0;

    return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function getDataHoje(format) {
    var date = new Date();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }

    if (format.toUpperCase() == "DD/MM/AAAA") {
        return [day, month, year].join("/");
    } else if (format.toUpperCase() == "AAAA-MM-DD") {
        return [year, month, day].join("-");
    } else {
        console.error("Formato da Data inválido (" + format.toUpperCase() + ")");
        throw "Formato da Data inválido (" + format.toUpperCase() + ")";
    }
}
function formataMoneyToFloat(valor){
    valor = valor.replace("R$","");
    valor = valor.split(".").join("");
    valor = valor.split(",").join(".");
    return parseFloat(valor);
}