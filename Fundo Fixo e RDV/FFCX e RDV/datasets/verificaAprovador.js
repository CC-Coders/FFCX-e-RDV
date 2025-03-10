//function createDataset(fields, constraints, sortFields) {
//
//	var newDataset = DatasetBuilder.newDataset(),
//		dataSource = "/jdbc/FluigRM",
//		ic = new javax.naming.InitialContext(),
//		ds = ic.lookup(dataSource),
//		created = false,
//		pCodcoligada = null,
//		pLocal = null,
//		pTipo = null,
//		pTotal = null,
//		i = null,
//		myQuery = null;
//
//
//	if (constraints != null) {
//		for (i = 0; i < constraints.length; i++) {
//
//			if (constraints[i].fieldName == "paramCodcoligada")
//				pCodcoligada = constraints[i].initialValue;
//
//			if (constraints[i].fieldName == "paramLocal")
//				pLocal = constraints[i].initialValue;
//
//			if (constraints[i].fieldName == "paramCodTmv")
//				pTipo = constraints[i].initialValue;
//
//			if (constraints[i].fieldName == "paramValorTotal")
//				pTotal = constraints[i].initialValue;
//
//		}
//	}
//
//	if (pLocal == 'Obra Ipubi') {
//		pLocal = 'Obra Restauração Ipubi Trindade';
//	}
//
//	if (pCodcoligada != null && pLocal != null && pTipo != null && pTotal != null) {
//
//		log.info("VALOR TOTAL PARAM = " + pTotal);
//
//		if (pTotal <= 20000) {
//
//			var myQuery = "SELECT distinct(codusuario) AS usuarioRM, codusuarioFluig AS usuarioFLUIG, perfil AS local, codcoligada AS coligada, codtmv AS tipoMov, CONVERT(INTEGER,limite) AS limite\
//	    			FROM viewPerfilUsuarioAprovacao\
//	    			WHERE codcoligada = "+ pCodcoligada + " \
//	    			AND perfil = '"+ pLocal + "'\
//	    			AND limite >=  "+ pTotal + "\
//	    			AND codtmv = '" + pTipo + "'\
//	    			AND codusuarioFluig IS NOT NULL\
//	    			ORDER BY limite";
//		}
//		// Busca o Engenheiro + o Aprovador Superior
//		else {
//
//			var myQuery = "SELECT distinct(codusuario) AS usuarioRM, codusuarioFluig AS usuarioFLUIG, perfil AS local, codcoligada AS coligada, codtmv AS tipoMov, CONVERT(INTEGER,limite) AS limite\
//	    			FROM viewPerfilUsuarioAprovacao\
//	    			WHERE codcoligada = "+ pCodcoligada + " \
//	    			AND perfil = '"+ pLocal + "'\
//	    			AND limite >=  20000 \
//	    			AND codtmv = '" + pTipo + "'\
//	    			AND codusuarioFluig IS NOT NULL\
//	    			ORDER BY limite";
//
//		}
//
//		log.info("QUERY APROVADOR" + myQuery);
//
//	}
//	else {
//		var myQuery = "Não possível realizar a consulta para à aprovação!";
//	}
//
//	try {
//		var conn = ds.getConnection();
//		var stmt = conn.createStatement();
//		var rs = stmt.executeQuery(myQuery);
//		var columnCount = rs.getMetaData().getColumnCount();
//
//		while (rs.next()) {
//			if (!created) {
//				for (var i = 1; i <= columnCount; i++) {
//					newDataset.addColumn(rs.getMetaData().getColumnName(i));
//				}
//				created = true;
//			}
//			var Arr = new Array();
//			for (var i = 1; i <= columnCount; i++) {
//				var obj = rs.getObject(rs.getMetaData().getColumnName(i));
//				if (null != obj) {
//					Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
//				} else {
//					Arr[i - 1] = "null";
//				}
//			}
//			newDataset.addRow(Arr);
//		}
//	} catch (e) {
//		log.error("ERRO==============> " + e.message);
//		newDataset.addColumn("FALHA");
//		newDataset.addRow([e.message]);
//	} finally {
//		if (stmt != null) {
//			stmt.close();
//		}
//		if (conn != null) {
//			conn.close();
//		}
//	}
//	return newDataset;
//
//}

function createDataset(fields, constraints, sortFields) {

	var newDataset = DatasetBuilder.newDataset(),
		dataSource = "/jdbc/FluigRM",
		ic = new javax.naming.InitialContext(),
		ds = ic.lookup(dataSource),
		created = false,
		pCodcoligada = null,
		pLocal = null,
		pTipo = null,
		pTotal = null,
		i = null,
		myQuery = null;


	if (constraints != null) {
		for (i = 0; i < constraints.length; i++) {

			if (constraints[i].fieldName == "paramCodcoligada")
				pCodcoligada = constraints[i].initialValue;

			if (constraints[i].fieldName == "paramLocal")
				pLocal = constraints[i].initialValue;

			if (constraints[i].fieldName == "paramCodTmv")
				pTipo = constraints[i].initialValue;

			if (constraints[i].fieldName == "paramValorTotal")
				pTotal = constraints[i].initialValue;

		}
	}

	if (pLocal == 'Obra Ipubi') {
		pLocal = 'Obra Restauração Ipubi Trindade';
	}

	if (pCodcoligada != null && pLocal != null && pTipo != null && pTotal != null) {

		log.info("VALOR TOTAL PARAM = " + pTotal);

		if (pTotal <= 20000 && pLocal != 'Obra COFCO' && pLocal != 'Obra MRS São Paulo' && pLocal != 'Obra MRS Manutenção São Paulo II' && pLocal != 'Obra MRS Remodelação Baixada Santista' && pLocal != 'Obra MRS Remodelação 2'
			&& pLocal != 'Obra VLI Manutenção' && pLocal != 'Obra Rumo Pai Mathias' && pLocal != 'Obra Rumo Revitalização Serra' && pLocal != 'Obra Rumo Valongo'
			&& pLocal != 'Obra VLI Planalto' && pLocal != 'Obra VLI Paulista' && pLocal != 'Obra MRS Pátios Vale do Paraíba' && pLocal != 'Obra VLI 5ª Linha TIPLAM') {

			var myQuery = "SELECT distinct(codusuario) AS usuarioRM, codusuarioFluig AS usuarioFLUIG, perfil AS local, codcoligada AS coligada, codtmv AS tipoMov, CONVERT(INTEGER,limite) AS limite\
	    			FROM viewPerfilUsuarioAprovacao\
	    			WHERE codcoligada = "+ pCodcoligada + " \
	    			AND perfil = '"+ pLocal + "'\
	    			AND limite >=  "+ pTotal + "\
	    			AND limite >  1\ AND codtmv = '" + pTipo + "'\ AND codusuarioFluig IS NOT NULL\
	    			ORDER BY limite";
		}
		// Busca o Engenheiro + o Aprovador Superior
		else if (pTotal > 20000 && pLocal != 'Obra COFCO' && pLocal != 'Obra MRS São Paulo' && pLocal != 'Obra MRS Manutenção São Paulo II' && pLocal != 'Obra MRS Remodelação Baixada Santista' && pLocal != 'Obra MRS Remodelação 2'
			&& pLocal != 'Obra VLI Manutenção' && pLocal != 'Obra Rumo Pai Mathias' && pLocal != 'Obra Rumo Revitalização Serra' && pLocal != 'Obra Rumo Valongo'
			&& pLocal != 'Obra VLI Planalto' && pLocal != 'Obra VLI Paulista' && pLocal != 'Obra MRS Pátios Vale do Paraíba' && pLocal != 'Obra VLI 5ª Linha TIPLAM') {

			var myQuery = "SELECT distinct(codusuario) AS usuarioRM, codusuarioFluig AS usuarioFLUIG, perfil AS local, codcoligada AS coligada, codtmv AS tipoMov, CONVERT(INTEGER,limite) AS limite\
	    			FROM viewPerfilUsuarioAprovacao\
	    			WHERE codcoligada = "+ pCodcoligada + " \
	    			AND perfil = '"+ pLocal + "'\
	    			AND limite >=  20000\
	    			AND codtmv = '" + pTipo + "'\ AND codusuarioFluig IS NOT NULL\
	    			ORDER BY limite";
		}
		else if ((pTotal <= 5000) && (pLocal == 'Obra COFCO' || pLocal == 'Obra MRS São Paulo' || pLocal == 'Obra MRS Manutenção São Paulo II' || pLocal == 'Obra MRS Remodelação Baixada Santista' || pLocal == 'Obra MRS Remodelação 2'
			|| pLocal == 'Obra VLI Manutenção' || pLocal == 'Obra Rumo Pai Mathias' || pLocal == 'Obra Rumo Revitalização Serra' || pLocal == 'Obra Rumo Valongo'
			|| pLocal == 'Obra VLI Planalto' || pLocal == 'Obra VLI Paulista' || pLocal == 'Obra MRS Pátios Vale do Paraíba' || pLocal == 'Obra VLI 5ª Linha TIPLAM')) {

			var myQuery = "SELECT distinct(codusuario) AS usuarioRM, codusuarioFluig AS usuarioFLUIG, perfil AS local, codcoligada AS coligada, codtmv AS tipoMov, CONVERT(INTEGER,limite) AS limite\
	    			FROM viewPerfilUsuarioAprovacao\
	    			WHERE codcoligada = "+ pCodcoligada + " \
	    			AND perfil = '"+ pLocal + "'\
	    			AND limite >=  "+ pTotal + "\
	    			AND limite >  1\ AND codtmv = '" + pTipo + "'\ AND codusuarioFluig IS NOT NULL\
	    			ORDER BY limite";
		}
		// Busca o Engenheiro + o Aprovador Superior
		else {

			var myQuery = "SELECT distinct(codusuario) AS usuarioRM, codusuarioFluig AS usuarioFLUIG, perfil AS local, codcoligada AS coligada, codtmv AS tipoMov, CONVERT(INTEGER,limite) AS limite\
	    			FROM viewPerfilUsuarioAprovacao\
	    			WHERE codcoligada = "+ pCodcoligada + " \
	    			AND perfil = '"+ pLocal + "'\
	    			AND limite >=  5000 \
	    			AND codtmv = '" + pTipo + "'\
	    			AND codusuarioFluig IS NOT NULL\
	    			ORDER BY limite";

		}

		log.info("QUERY APROVADOR" + myQuery);

	}
	else {
		var myQuery = "Não possível realizar a consulta para à aprovação!";
	}

	try {
		var conn = ds.getConnection();
		var stmt = conn.createStatement();
		var rs = stmt.executeQuery(myQuery);
		var columnCount = rs.getMetaData().getColumnCount();

		while (rs.next()) {
			log.info("Usuário encontrado: " + rs.getObject("usuarioFLUIG") + " com limite: " + rs.getObject("limite")); // Log adicionado
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
					Arr[i - 1] = "null";
				}
			}
			newDataset.addRow(Arr);
		}
	} catch (e) {
		log.error("ERRO==============> " + e.message);
		newDataset.addColumn("FALHA");
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
