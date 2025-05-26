function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["IDMOV"]);

        var env = getEnviroment();
        var nomeTabelaFormulario = {
            PRODUCAO: "ML00156422",
            HOMOLOGACAO: "ML001070",
        }[env];

        var myquery = ""
        myquery += "SELECT  ";
        myquery += "	Processo.NUM_PROCES,  ";
        myquery += "	CASE  ";
        myquery += "		WHEN Processo.STATUS = 0 THEN 'Em andamento' ";
        myquery += "		WHEN Processo.STATUS = 1 THEN 'Cancelado' ";
        myquery += "		WHEN Processo.STATUS = 2 THEN 'Finalizado' ";
        myquery += "	END AS STATUS ";
        myquery += "FROM " + nomeTabelaFormulario + " Formulario ";
        myquery += "INNER JOIN PROCES_WORKFLOW PROCESSO ON PROCESSO.NR_DOCUMENTO_CARD = Formulario.documentid ";
        myquery += "WHERE  ";
        myquery += "modalidade = 'Recebimento' ";
        myquery += "AND IdMovimento = ?;";

        var result = executeQuery("jdbc/AppDS", myquery, [constraints.IDMOV]);

        return returnDataset("OK", "Consulta realizada com sucesso", JSON.stringify(result));

    } catch (error) {
        if (typeof error == "object") {
            var mensagem = "";
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem += (keys[i] + ": " + error[keys[i]]) + " - ";
            }
            log.info("Erro ao executar Dataset:");
            log.dir(error);
            log.info(mensagem);

            return returnDataset("ERRO", mensagem, null);
        } else {
            return returnDataset("ERRO", error, null);
        }
    }
}


// SQL
function executeQuery(datasource,myquery, constraints) {
    try {
        var dataSource = datasource;
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);
        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(myquery);
        stmt.setInt(1, constraints[0]);
        var rs = stmt.executeQuery();
        var retorno = [];
        var columnCount = rs.getMetaData().getColumnCount();

        while (rs.next()) {
            var linha = {};
            for (var i = 1; i <= columnCount; i++) {
                linha[rs.getMetaData().getColumnName(i)] = rs.getObject(rs.getMetaData().getColumnName(i)).toString() + "";
            }
            retorno.push(linha);
        }
        return retorno;
    } catch (e) {
        throw e;
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
}


// Utils
function getConstraints(constraints) {
    var retorno = {};
    if (constraints != null) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            retorno[constraint.fieldName] = constraint.initialValue;
        }
    }
    return retorno;
}
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}
function lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias) {
    try {
        var retornoErro = [];
        for (var i = 0; i < listConstrainstObrigatorias.length; i++) {
            if (constraints[listConstrainstObrigatorias[i]] == null || constraints[listConstrainstObrigatorias[i]] == "" || constraints[listConstrainstObrigatorias[i]] == undefined) {
                retornoErro.push(listConstrainstObrigatorias[i]);
            }
        }

        if (retornoErro.length > 0) {
            throw "Constraints obrigatorias nao informadas (" + retornoErro.join(", ") + ")";
        }
    } catch (error) {
        throw error;
    }
}
function getEnviroment() {
    var URL = fluigAPI.getPageService().getServerURL();

    if (URL == "http://fluig.castilho.com.br:1010") {
        return "PRODUCAO";
    }
    else {
        return "HOMOLOGACAO";
    }
}

