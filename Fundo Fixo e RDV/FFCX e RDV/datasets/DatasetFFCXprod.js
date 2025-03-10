function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {
    var codColigada = null;
    var operacao = null;
    var myQuery = null;
    var CODTB1FLX = null;
    var CODLOC = null;


    if (constraints != null) {
        for (i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName == 'OPERACAO') {
                operacao = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODCOLIGADA') {
                codColigada = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CCUSTO') {
                codCCusto = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODCFO') {
                CODCFO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'IDMOV') {
                IDMOV = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'NUMEROMOV') {
                NUMEROMOV = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'ATIVO') {
                ATIVO = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'FILIAL') {
                FILIAL = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODTB1FLX') {
                CODTB1FLX = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == 'CODLOC') {
                CODLOC = constraints[i].initialValue;
            }
        }
    }

    if (operacao == 'buscaProdutos') {
        myQuery =
            "SELECT\
        CODCOLPRD as CODCOLIGADA,\
        TPRODUTO.IDPRD,\
        TPRODUTODEF.CODTB1FAT,\
        CODIGOPRD,\
        NOMEFANTASIA,\
        TPRODUTODEF.CODUNDCONTROLE as UNIDADE,\
        TPRODUTO.CAMPOLIVRE2\
    FROM\
        TPRODUTO\
        INNER JOIN TPRODUTODEF ON TPRODUTODEF.CODCOLIGADA=1 AND TPRODUTODEF.IDPRD = TPRODUTO.IDPRD\
    WHERE \
        INATIVO = 0 \
        AND CODCOLPRD = 1\
        AND ULTIMONIVEL = 1\
        AND TPRODUTO.CAMPOLIVRE2 = 'S'\
    ORDER BY CODIGOPRD\
    "
    }

    if (operacao == 'buscaProdutosPorColigada') {
        myQuery =
            "SELECT\
        CODCOLPRD as CODCOLIGADA,\
        TPRODUTO.IDPRD,\
        TPRODUTODEF.CODTB1FAT,\
        CODIGOPRD,\
        NOMEFANTASIA,\
        TPRODUTODEF.CODUNDCONTROLE as UNIDADE,\
        TPRODUTO.CAMPOLIVRE2\
    FROM\
        TPRODUTO\
        INNER JOIN TPRODUTODEF ON TPRODUTODEF.CODCOLIGADA= "+ codColigada + " AND TPRODUTODEF.IDPRD = TPRODUTO.IDPRD\
    WHERE \
        INATIVO = 0 \
        AND CODCOLPRD = "+ codColigada + "\
        AND ULTIMONIVEL = 1\
        AND TPRODUTO.CAMPOLIVRE2 = 'S'\
    ORDER BY CODIGOPRD\
    "
    }

    if (operacao == 'buscaLocalDeEstoquePorCentroDeCusto') {
        myQuery =
            "SELECT\
            CODCOLIGADA,\
            CODFILIAL,\
            CODLOC,\
            INATIVO,\
            NOME\
        FROM\
            TLOC\
        WHERE\
            CODCOLIGADA = 1\
            AND INATIVO = 0\
            AND NOME = '"+ codCCusto + "'\
            ";
    }

    if (operacao == 'puxaFormaPagamentoFFCXRDO') {
        if (CODTB1FLX == "1") {
            myQuery =
                "SELECT * \
                FROM FTB1\
            WHERE\
                CODCOLIGADA ='"+ codColigada + "' AND\
                ATIVO = '1'\
            ";
        }
        else {
            log.info("teste do cod+ " + CODTB1FLX);
            myQuery =
                "SELECT * \
                FROM FTB1\
            WHERE\
                CODCOLIGADA ='"+ codColigada + "' AND\
                ATIVO = '1' AND\
                FTB1.CODTB1FLX = '"+ CODTB1FLX + "'";
        }
    }

    if (operacao == 'SelectMov') {
        myQuery =
            "SELECT\
                TMOV.IDMOV,\
                TMOV.NUMEROMOV,\
                TMOV.VALORBRUTO,\
                TLOC.NOME AS NOMECENTRODECUSTO,\
                TMOV.STATUS,\
                TMOV.CODFILIAL,\
                TMOV.CODLOC\
            FROM\
                TMOV\
                INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
                INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
            WHERE\
                TMOV.CODTMV = '1.1.03'\
                AND TMOV.CODCOLIGADA = '"+ codColigada + "'\
                AND TMOV.CODFILIAL = '"+ FILIAL + "'\
                AND TMOV.CODCFO = '"+ CODCFO + "'\
                AND TMOV.CODLOC = '"+ CODLOC + "'\
            ORDER BY TMOV.IDMOV DESC\
        ";
    }

    if (operacao == 'SelectMovRDO') {
        myQuery =
            "SELECT\
                    TMOV.IDMOV,\
                    TMOV.NUMEROMOV,\
                    TMOV.VALORBRUTO,\
                    TLOC.NOME AS NOMECENTRODECUSTO,\
                    TMOV.STATUS,\
                    TMOV.CODFILIAL,\
                    TMOV.CODLOC,\
                    TMOVHISTORICO.HISTORICOCURTO\
                FROM\
                    TMOV\
                    INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
                    INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
                    INNER JOIN TMOVHISTORICO ON TMOV.IDMOV = TMOVHISTORICO.IDMOV AND TMOVHISTORICO.CODCOLIGADA = TMOV.CODCOLIGADA\
                WHERE\
                    TMOV.CODTMV = '1.1.09'\
                    AND TMOV.CODCOLIGADA = '"+ codColigada + "'\
                    AND TMOV.CODFILIAL = '"+ FILIAL + "'\
                    AND TMOV.CODCFO = '"+ CODCFO + "'\
                    AND TMOV.CODLOC = '"+ CODLOC + "'\
                ORDER BY TMOV.IDMOV DESC\
            "
            ;
    }

    if (operacao == 'AprovaFF') {
        myQuery =
            "SELECT\
        TMOV.IDMOV,\
        TMOV.VALORBRUTO,\
        TLOC.NOME  AS NOMECENTRODECUSTO\
    FROM\
        TMOV\
        INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
        INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
    WHERE\
        TMOV.STATUS = 'A'\
        AND TMOV.CODTMV = '1.1.03'\
        AND TMOV.NUMEROMOV = '" + NUMEROMOV + "'\
    ORDER BY TMOV.IDMOV DESC\
   ";
    }

    if (operacao == "SelectItem") {
        myQuery =
            "SELECT\
            TITMMOV.PRECOUNITARIO,\
            TPRODUTO.NOMEFANTASIA,\
            TPRODUTO.CODIGOPRD,\
            TPRODUTO.IDPRD,\
            HISTORICOCURTO,\
            TITMMOV.NSEQITMMOV,\
            TPRODUTODEF.CODTB1FAT,\
            TMOV.DATAEMISSAO,\
            TPRODUTODEF.CODUNDCONTROLE as UNIDADE,\
            TMOV.IDMOV\
        FROM\
            TITMMOV\
                INNER JOIN TMOV ON TITMMOV.IDMOV = TMOV.IDMOV AND TITMMOV.CODCOLIGADA = TMOV.CODCOLIGADA\
                INNER JOIN TPRODUTO ON TPRODUTO.CODCOLPRD = TMOV.CODCOLIGADA AND TPRODUTO.IDPRD = TITMMOV.IDPRD\
                INNER JOIN TITMMOVHISTORICO ON TITMMOV.IDMOV = TITMMOVHISTORICO.IDMOV AND TITMMOV.NSEQITMMOV = TITMMOVHISTORICO.NSEQITMMOV AND TITMMOV.CODCOLIGADA = TITMMOVHISTORICO.CODCOLIGADA\
                INNER JOIN TPRODUTODEF ON TPRODUTODEF.CODCOLIGADA = " + codColigada + " AND TPRODUTODEF.IDPRD = TPRODUTO.IDPRD\
        WHERE\
            TMOV.IDMOV = '" + IDMOV + "'\
        ORDER BY TMOV.IDMOV DESC\
    "
    }

    if (operacao == "ShowRateioDepartamento") {
        myQuery = "\
        SELECT\
        GDEPTO.NOME AS NOMEDEPARTAMENTO,\
        GDEPTO.CODDEPARTAMENTO,\
        TITMMOVRATDEP.VALOR AS VALORRATEIO,\
        NSEQITMMOV\
        FROM\
        TITMMOVRATDEP\
        INNER JOIN GDEPTO ON GDEPTO.CODCOLIGADA = TITMMOVRATDEP.CODCOLIGADA AND TITMMOVRATDEP.CODDEPARTAMENTO = GDEPTO.CODDEPARTAMENTO AND GDEPTO.CODFILIAL = TITMMOVRATDEP.CODFILIAL\
    WHERE\
        TITMMOVRATDEP.IDMOV = '" + IDMOV + "'\
        AND TITMMOVRATDEP.CODCOLIGADA = " + codColigada + "\
        ORDER BY TITMMOVRATDEP.NSEQITMMOV\
        "
    }

    if (operacao == "PuxaDepartamentosPorFilial") {
        myQuery = "\
    select distinct\
        nome,\
		CODCOLIGADA,\
        CODDEPARTAMENTO,\
		CODFILIAL\
    from\
        gdepto\
    where\
        ativo = 'T' AND\
        codColigada = '1' and\
		codfilial = '"+ FILIAL + "'\
    order by\
        gdepto.nome\
    "
    }

    if (operacao == "ShowRateioCentroDeCusto") {
        myQuery = "\
    SELECT\
        GCCUSTO.NOME  AS NOMECENTRODECUSTO,\
        TITMMOVRATCCU.VALOR AS VALORRATCCUSTO,\
        NSEQITMMOV,\
        TITMMOVRATCCU.CODCCUSTO\
    FROM\
        TITMMOVRATCCU\
        INNER JOIN TMOV ON TMOV.IDMOV = TITMMOVRATCCU.IDMOV AND TMOV.CODCOLIGADA = TITMMOVRATCCU.CODCOLIGADA\
        INNER JOIN GCCUSTO ON GCCUSTO.CODCOLIGADA = TMOV.CODCOLIGADA AND GCCUSTO.CODCCUSTO = TITMMOVRATCCU.CODCCUSTO\
    WHERE\
	    TITMMOVRATCCU.IDMOV = '" + IDMOV + "'\
	    AND TITMMOVRATCCU.CODCOLIGADA = " + codColigada + "\
    ORDER BY TITMMOVRATCCU.NSEQITMMOV\
        "
    }

    if (operacao == "GeraXML1207") {
        myQuery = "SELECT\
        TMOV.IDMOV,\
        TMOV.VALORBRUTO,\
		TMOV.SERIE,\
		TMOV.NUMEROMOV,\
		TITMMOV.NSEQITMMOV,\
        TMOV.DATAEMISSAO,\
        TLOC.NOME AS NOMECENTRODECUSTO\
    FROM\
        TMOV\
		INNER JOIN TITMMOV ON TITMMOV.IDMOV = TMOV.IDMOV AND TITMMOV.CODCOLIGADA = TMOV.CODCOLIGADA\
        INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
    WHERE\
        TMOV.STATUS = 'A'\
        AND TMOV.CODTMV = '1.1.03'\
        AND TMOV.IDMOV = '" + IDMOV + "'\
    ORDER BY TMOV.IDMOV DESC"
    }

    if (operacao == "GeraXMLRDO") {
        myQuery = "SELECT\
        TMOV.IDMOV,\
        TMOV.VALORBRUTO,\
		TMOV.SERIE,\
		TMOV.NUMEROMOV,\
		TITMMOV.NSEQITMMOV,\
        TMOV.DATAEMISSAO,\
        TLOC.NOME  AS NOMECENTRODECUSTO\
    FROM\
        TMOV\
		INNER JOIN TITMMOV ON TITMMOV.IDMOV = TMOV.IDMOV AND TITMMOV.CODCOLIGADA = TMOV.CODCOLIGADA\
        INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
    WHERE\
        TMOV.STATUS = 'A'\
        AND TMOV.CODTMV = '1.1.09'\
        AND TMOV.IDMOV = '" + IDMOV + "'\
    ORDER BY TMOV.IDMOV DESC"
    }

    if (operacao == "PuxaCondPgto") {
        myQuery = "\
        SELECT * FROM TCPG WHERE APLICACAOFRM = 'T' AND CODCOLIGADA ='" + codColigada + "'\
        "
    }

    if (operacao == 'SelectMovEmail') {
        myQuery =
            "SELECT\
        TMOV.IDMOV,\
        TMOV.VALORBRUTO,\
        TLOC.NOME  AS NOMECENTRODECUSTO,\
        TMOV.NUMEROMOV\
    FROM\
        TMOV\
        INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = '"+ codColigada + "'\
        INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
    WHERE\
        TMOV.CODTMV = '1.2.07'\
        AND TMOV.NUMEROMOV = '" + NUMEROMOV + "'\
    ORDER BY TMOV.IDMOV DESC\
   ";
    }

    if (operacao == 'SelectMovEmailRDO') {
        myQuery =
            "SELECT\
        TMOV.IDMOV,\
        TMOV.VALORBRUTO,\
        TLOC.NOME  AS NOMECENTRODECUSTO,\
        TMOV.NUMEROMOV\
    FROM\
        TMOV\
        INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = '"+ codColigada + "'\
        INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
    WHERE\
        TMOV.CODTMV = '1.2.10'\
        AND TMOV.NUMEROMOV = '" + NUMEROMOV + "'\
    ORDER BY TMOV.IDMOV DESC\
   ";
    }

    if (operacao == 'ShowMovAprovacao') {
        if (codColigada === 12) {
            myQuery =
                "SELECT\
                TMOV.IDMOV,\
                TMOV.VALORBRUTO,\
                TLOC.NOME  AS NOMECENTRODECUSTO,\
                TMOV.NUMEROMOV\
            FROM\
                TMOV\
                INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
                INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
            WHERE\
                TMOV.CODTMV = '1.1.03'\
                AND TMOV.IDMOV = '" + IDMOV + "'\
            ORDER BY TMOV.IDMOV DESC\
           ";
        } else {
            myQuery =
                "SELECT\
                TMOV.IDMOV,\
                TMOV.VALORBRUTO,\
                TLOC.NOME  AS NOMECENTRODECUSTO,\
                TMOV.NUMEROMOV\
            FROM\
                TMOV\
                INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
                INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
            WHERE\
                TMOV.CODTMV = '1.1.03'\
                AND TMOV.IDMOV = '" + IDMOV + "'\
            ORDER BY TMOV.IDMOV DESC\
           ";
        }
    }

    if (operacao == 'ShowMovAprovacaoRDO') {
        if (codColigada === 12) {
            myQuery =
                "SELECT\
                TMOV.IDMOV,\
                TMOV.VALORBRUTO,\
                TLOC.NOME  AS NOMECENTRODECUSTO,\
                TMOV.NUMEROMOV,\
                TMOV.SERIE AS SERIE,\
                TMOV.CHAVEACESSONFE AS CHAVEACESSO\
            FROM\
                TMOV\
                INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
                INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
            WHERE\
                TMOV.CODTMV = '1.1.09'\
                AND TMOV.CODCOLIGADA = '" + codcoligada + "'\
                AND TMOV.IDMOV = '" + IDMOV + "'\
            ORDER BY TMOV.IDMOV DESC\
            ";
        } else {
            myQuery =
                "SELECT\
                    TMOV.IDMOV,\
                    TMOV.VALORBRUTO,\
                    TLOC.NOME  AS NOMECENTRODECUSTO,\
                    TMOV.NUMEROMOV,\
                TMOV.SERIE AS SERIE,\
                TMOV.CHAVEACESSONFE AS CHAVEACESSO\
                FROM\
                    TMOV\
                    INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
                    INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
                WHERE\
                    TMOV.CODTMV = '1.1.09'\
                    AND TMOV.IDMOV = '" + IDMOV + "'\
                ORDER BY TMOV.IDMOV DESC\
            ";
        }
    }

    if (operacao == 'VerificaAprovacaoFundoFixo') {
        myQuery = "SELECT * FROM FCFOCOMPL\
        WHERE CODCFO = '"+ CODCFO + "'\
        "
    }

    if (operacao == 'ShowMovsAprovados') {
        myQuery =
            "SELECT\
        TMOV.IDMOV,\
        TMOV.VALORBRUTO,\
        TLOC.NOME  AS NOMECENTRODECUSTO\
    FROM\
        TMOV\
        INNER JOIN FCFO ON FCFO.CODCFO = TMOV.CODCFO AND FCFO.CODCOLIGADA = 0\
        INNER JOIN TLOC ON TLOC.CODCOLIGADA = TMOV.CODCOLIGADA AND TMOV.CODFILIAL = TLOC.CODFILIAL AND TLOC.CODLOC = TMOV.CODLOC\
    WHERE\
        TMOV.CODTMV = '1.2.07'\
        AND TMOV.NUMEROMOV = '" + NUMEROMOV + "'\
    ORDER BY TMOV.IDMOV DESC\
   "
    }

    if (operacao == "PuxarFundosFixos") {
        myQuery = "SELECT\
        CODCFO,\
        NOME,\
        DATAULTMOVIMENTO\
    FROM\
	    FCFO\
    WHERE \
        CODTCF = '011'\
        AND ATIVO = '" + ATIVO + "'\
        "
    }

    if (operacao == "PuxarRDO") {
        myQuery = "SELECT\
        CODCFO,\
        NOME,\
        DATAULTMOVIMENTO\
    FROM\
	    FCFO\
    WHERE \
        CODTCF = '020'\
        AND ATIVO = '" + ATIVO + "'\
        "
    }

    if (operacao == "ListaLocalDeEstoqueFFCX") {
        myQuery = "\
    SELECT\
        GFILIAL.CODCOLIGADA,\
        GFILIAL.CODFILIAL,\
        CODLOC,\
        TLOC.NOME,\
        GCCUSTO.CODCCUSTO\
    FROM\
        GFILIAL\
        INNER JOIN TLOC ON TLOC.CODFILIAL = GFILIAL.CODFILIAL\
        INNER JOIN GCCUSTO on TLOC.NOME = GCCUSTO.NOME\
    WHERE \
        GFILIAL.ATIVO = '1' AND\
        TLOC.INATIVO = '0' AND\
        GCCUSTO.ATIVO = 'T' AND\
        GFILIAL.CODCOLIGADA = " + codColigada + " AND\
        TLOC.CODCOLIGADA = " + codColigada + " AND\
        GCCUSTO.CODCOLIGADA = " + codColigada + "\
    ORDER BY\
        CODCCUSTO"
    }

    if (operacao == "ListaLocalDeEstoque") {
        myQuery = "\
    SELECT\
        GFILIAL.CODCOLIGADA,\
        GFILIAL.CODFILIAL,\
        CODLOC,\
        TLOC.NOME,\
        GCCUSTO.CODCCUSTO\
    FROM\
        GFILIAL\
        INNER JOIN TLOC ON TLOC.CODFILIAL = GFILIAL.CODFILIAL\
        INNER JOIN GCCUSTO on TLOC.NOME = GCCUSTO.NOME\
    WHERE \
        GFILIAL.ATIVO = '1' AND\
        TLOC.INATIVO = '0' AND\
        GCCUSTO.ATIVO = 'T' AND\
        GFILIAL.CODCOLIGADA = '1' AND\
        TLOC.CODCOLIGADA = '1' AND\
        GCCUSTO.CODCOLIGADA = '1'\
    ORDER BY\
        CODCCUSTO"
    }

    if (operacao == "ListaCentroDeCusto") {
        myQuery = "\
    SELECT\
        CODCCUSTO,\
        nome,\
        CODCOLIGADA\
    FROM\
        gccusto\
    WHERE\
        CODCOLIGADA = '1'\
        AND ATIVO='T'\
    ORDER BY\
        CODCCUSTO"
    }

    log.info("My query ds: " + myQuery)

    return ExcutaQuery(myQuery);

}
function onMobileSync(user) {

}

function ExcutaQuery(myQuery) {
    var newDataset = DatasetBuilder.newDataset();
    var dataSource = "/jdbc/FluigRM"; // nome da conexão usada no standalone
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;
    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(myQuery);
        var columnCount = rs.getMetaData().getColumnCount();
        while (rs.next()) {
            if (!created) {
                for (var i = 1; i <= columnCount; i++) {
                    newDataset.addColumn(rs.getMetaData().getColumnName(i));
                }
                created = true;
            }
            var Arr = new Array();
            for (var i = 1; i <= columnCount; i++) {
                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "---";
                }
            }
            newDataset.addRow(Arr);
        }

    } catch (e) {
        log.error("ERRO==============> " + e.message);
    }
    finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }

    log.info("newdataset: " + newDataset);
    return newDataset;
}