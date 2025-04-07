function resolve(process, colleague) {
	var userList = new java.util.ArrayList();

	var coligada = hAPI.getCardValue("coligada");
	var coligadaString = coligada.split("-");
	var coligadaSelect = coligadaString[0].trim();

	// nome da Obra
	var localEstoque = hAPI.getCardValue("selectLocalEstoque");
	var estoqueString = localEstoque.split("-");
	var estoqueSelect = estoqueString[estoqueString.length - 1].trim();
	var descLocEstoque = buscaDescricaoLocalDeEstoque(coligadaSelect, estoqueSelect);

	var codTmv = "1.1.02";

	//total do movimento
	var valor = hAPI.getCardValue("hiddenValorTotalFFCX");

	if(descLocEstoque == "Matriz Curitiba") {
		// userList.add('padilha');
		userList.add('padilha');
		return userList;
	} else if ((descLocEstoque == "Matriz São Paulo" || descLocEstoque == "Matriz Curitiba") && coligadaSelect == "12") {
		// userList.add('padilha');
		userList.add('claudia');
	}
	else {
		log.info("AprovEngProvisao: " + coligada + " - " + descLocEstoque + " - " + codTmv + " - " + valor);
		var c1 = DatasetFactory.createConstraint("paramCodcoligada", coligadaSelect+"", coligadaSelect+"", ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("paramLocal", descLocEstoque+"", descLocEstoque+"", ConstraintType.MUST);
		var c3 = DatasetFactory.createConstraint("paramCodTmv", codTmv+"", codTmv+"", ConstraintType.MUST);
		var c4 = DatasetFactory.createConstraint("paramValorTotal", valor+"", valor+"", ConstraintType.MUST);
		var arr = [c1, c2, c3, c4];
		var resultDataset = DatasetFactory.getDataset("verificaAprovador", null, arr, null);

		for (var count = 0; count < resultDataset.rowsCount; count++) {
			var user = resultDataset.getValue(count, "usuarioFLUIG");

			userList.add(user);

			return userList;
		}
	}
	throw "Aprovador n�o encontrado."
}


function buscaDescricaoLocalDeEstoque(codcoligada, codloc){
	var selectFilial = hAPI.getCardValue("selectFilial");


	var ds = DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos",null,[
			DatasetFactory.createConstraint("operacao", "BuscaLocalDeEstoque", "BuscaLocalDeEstoque", ConstraintType.MUST),
			DatasetFactory.createConstraint("codcoligada", codcoligada, codcoligada, ConstraintType.MUST),
			DatasetFactory.createConstraint("codfilial", selectFilial, selectFilial, ConstraintType.MUST),
			DatasetFactory.createConstraint("permissaoGeral", "true", "true", ConstraintType.MUST),
		],null);


	log.info("AprovEngProvisao: codloc: " + codloc);
	for (var i = 0; i < ds.rowsCount; i++) {
		log.info("AprovEngProvisao: loc: " + ds.getValue(i, "CODLOC"));
		if (codloc == ds.getValue(i, "CODLOC")) {
			return ds.getValue(i, "NOME");
		}
	}
	return "";
}