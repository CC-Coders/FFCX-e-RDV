function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {
	var CODCOLIGADA = null;
	var TipoProduto = null;
	var TipoFundo = null;
	var myQuery = null;
	if (constraints != null) {
		for (var i = 0; i < constraints.length; i++) {
			if (constraints[i].fieldName == "CODCOLIGADA") {
				CODCOLIGADA = constraints[i].initialValue;
			}
			if (constraints[i].fieldName == "TipoProduto") {
				TipoProduto = constraints[i].initialValue;
			}
			if(constraints[i].fieldName == "Tipo"){
				TipoFundo = constraints[i].initialValue;
			}
		}
	}

	if (CODCOLIGADA != null && TipoProduto != null) {
		/*####Monta as Colunas da Query####*/
		var SELECT =
			"SELECT DISTINCT\
				TPRODUTO.CODIGOPRD,\
				TPRODUTO.NOMEFANTASIA,\
				TPRODUTO.IDPRD,\
				TPRODUTO.CODCOLPRD,\
				DEF.CODUNDCONTROLE,\
				TPRODUTO.CODIGOPRD + ' - ' + TPRODUTO.NOMEFANTASIA VISUAL,\
				CASE\
					WHEN SUBSTRING(TPRODUTO.CODIGOPRD, 0, 3) = '40' THEN 'Sim'\
					ELSE 'Não'\
				END Codigo,\
				TPRODUTO.TIPO,\
				DEF.NUMDECPRECO as DECIMAIS,\
				DEF.CODTB1FAT";


		/*###Monta as Tabelas da Query####*/
		var FROM =
			"FROM\
				TPRODUTO\
				INNER JOIN TPRODUTODEF DEF ON TPRODUTO.IDPRD = DEF.IDPRD AND TPRODUTO.CODCOLPRD = DEF.CODCOLIGADA\
				LEFT JOIN TPRDGRUPOPRODUTO ON TPRDGRUPOPRODUTO.CODCOLGRUPO = TPRODUTO.CODCOLPRD AND TPRDGRUPOPRODUTO.CODCOLPRD = TPRODUTO.CODCOLPRD AND TPRDGRUPOPRODUTO.IDPRD = TPRODUTO.IDPRD";

		if(TipoFundo == "RDO"){
			var WHERE =
			"WHERE\
				TPRODUTO.INATIVO = 0\
				AND TPRODUTO.ULTIMONIVEL = 1\
				AND TPRODUTO.CODCOLPRD = '" + CODCOLIGADA + "'\
				AND TPRODUTO.CAMPOLIVRE2 = 'S'\
				AND TPRODUTO.CODIGOPRD IN ('11.002.00004', '10.001.00003', '11.002.00003', '30.998.00050', '30.998.00051', '30.998.00052', '30.998.00053', '11.002.00005', '11.001.00018', '11.001.00061', '11.002.00009', '11.002.00010', '10.001.00097', '10.001.00099', '11.001.00034', '11.004.00005', '11.004.00010', '11.001.00067')";
		}
		else{
		var WHERE =
			"WHERE\
				TPRODUTO.INATIVO = 0\
				AND TPRODUTO.ULTIMONIVEL = 1\
				AND TPRODUTO.CODCOLPRD = '" + CODCOLIGADA + "'\
				AND TPRODUTO.CAMPOLIVRE2 = 'S'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '10.002%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '10.003%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.003%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.004%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.005%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.008%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.009%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.010%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.995%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.996%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.001%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.002%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.999%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '31.999%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '40.001%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '40.002%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '40.003%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '40.004%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '41.001%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '41.002%'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00003'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00029'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00042'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00043'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00044'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00045'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00046'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00047'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '30.998.00048'\
				AND TPRODUTO.CODIGOPRD NOT LIKE '11.002.00008'\
				";
		}


		if (TipoProduto == "CT-e") {
			/*Busca os Produtos do Grupo Transporte*/
			WHERE += " AND (TPRDGRUPOPRODUTO.CODGRUPO = '0001' AND TPRDGRUPOPRODUTO.GRUPOPRINCIPAL = 1)";
		}
		else if (TipoProduto == "OC/OS") {
			//Busca os produtos que não sejam Transportes
			WHERE += " AND (TPRDGRUPOPRODUTO.CODGRUPO IS NULL OR TPRDGRUPOPRODUTO.GRUPOPRINCIPAL IS NULL)";
		}

		WHERE += "AND TPRODUTO.CODIGOPRD NOT IN ('11.002.00001', '11.002.00002', '11.001.00099', '11.099.00001', '11.099.00002')";


		/*####Monta a Ordenação da Query####*/
		var ORDERBY = "ORDER BY TPRODUTO.NOMEFANTASIA";


		/*####Monta a Query####*/
		myQuery = SELECT + " " + FROM + " " + WHERE + " " + ORDERBY;
		log.info("MyQuery: " + myQuery);
	}

	return executaQuery(myQuery);

}

function executaQuery(query) {
	var newDataset = DatasetBuilder.newDataset(),
		dataSource = "/jdbc/RM",
		ic = new javax.naming.InitialContext(),
		ds = ic.lookup(dataSource),
		created = false;
	try {
		var conn = ds.getConnection();
		var stmt = conn.createStatement();
		var rs = stmt.executeQuery(query);
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
					Arr[i - 1] = "   -   ";
				}
			}

			newDataset.addRow(Arr);
		}
	} catch (e) {
		log.error("ERRO==============> " + e.message);
		newDataset.addColumn("coluna");
		newDataset.addRow(["deu erro! "]);
		newDataset.addRow([e.message]);
	} finally {
		if (stmt != null) {
			stmt.close();
		}
		if (conn != null) {
			conn.close();
		}
	}
	return newDataset;
}