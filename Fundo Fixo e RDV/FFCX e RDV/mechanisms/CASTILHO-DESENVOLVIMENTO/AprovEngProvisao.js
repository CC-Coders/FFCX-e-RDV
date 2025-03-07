function resolve(process, colleague) {
	var userList = new java.util.ArrayList();

	var coligada = hAPI.getCardValue("coligada");
	var coligadaString = coligada.split("-");
	var coligadaSelect = coligadaString[0].trim();

	// nome da Obra
	var localEstoque = hAPI.getCardValue("selectLocalEstoque");
	var estoqueString = localEstoque.split("-");
	var estoqueSelect = estoqueString[estoqueString.length - 1].trim();

	var codTmv = "1.1.02";

	//total do movimento
	var valor = hAPI.getCardValue("valorTotalFFCX");

	if(estoqueSelect == "Matriz Curitiba") {
		// userList.add('padilha');
		userList.add('eder.sato');
		return userList;
	} else if (estoqueSelect == "Matriz" && coligadaSelect == "12") {
		// userList.add('padilha');
		userList.add('eder.sato');
	}
	else {
		var c1 = DatasetFactory.createConstraint("paramCodColigada", coligadaSelect, coligadaSelect, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("paramLocal", estoqueSelect, estoqueSelect, ConstraintType.MUST);
		var c3 = DatasetFactory.createConstraint("paramCodTmv", codTmv, codTmv, ConstraintType.MUST);
		var c4 = DatasetFactory.createConstraint("paramValorTotal", valor, valor, ConstraintType.MUST);
		var arr = [c1, c2, c3, c4];

		var resultDataset = DatasetFactory.getDataset("verificaAprovador", null, arr, null);

		for (var count = 0; count < resultDataset.length; count++) {
			var user = resultDataset.getValue(count, "usuarioFLUIG");

			userList.add(user);

			return userList;
		}
	}
	throw "Aprovador não encontrado."
}