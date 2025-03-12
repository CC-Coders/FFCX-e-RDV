function defineStructure() { }
function onSync(lastSyncDate) { }
function createDataset(fields, constraints, sortFields) {

	var pXML,
		pCodcoligada,
		pUsuario = "fluig",
		pPassword = "flu!g@cc#2018",
		pDataServerName = "MOVMOVIMENTOTBCDATA";
		
	var dataset = DatasetBuilder.newDataset();
	dataset.addColumn("status");
	dataset.addColumn("mensagem");
	dataset.addColumn("idmov");
	
	if (constraints != null)
    {
        for (i = 0; i < constraints.length; i++) 
        {
        	if (constraints[i].fieldName == "pXML"){ 
        		pXML = constraints[i].initialValue; 
				log.info("AtualizaMovimento pXML: "+ pXML);
        	}
        	if(constraints[i].fieldName == "pCodcoligada") {
        		pCodcoligada = constraints[i].initialValue; 
				log.info("AtualizaMovimento pCodcoligada: "+ pCodcoligada);
        	}
       }
    }
	else {
		return e("Sem parâmetros");
	}
		    
	try {
			
		var context = "CODSISTEMA=T;CODCOLIGADA="+pCodcoligada;
		
		var service = ServiceManager.getService("wsDataServerRM");
		var serviceHelper = service.getBean();
		var serviceLocator = service.instantiate("ws.WsDataServer");
		var wsObj = serviceLocator.getRMIwsDataServer();
	    	
	   	var authService = serviceHelper.getBasicAuthenticatedClient(wsObj, "ws.IwsDataServer", pUsuario, pPassword);
	   	log.info("pdataservername: " + pDataServerName);
	   	log.info("pxml atualizamovimento: " + pXML);
	   	log.info("context atualiza movimento: " + context);
	   	
	   	var resultado = authService.saveRecord(pDataServerName, pXML, context);		
	   	log.info("resultado atualiza movimento: " + resultado);

		
	   	// Retorno correto (CODCOLIGADA;IDMOV) Exemplo: "1;758699"
	   	// if (resultado.indexOf(";") == pCodcoligada) {
		if (resultado.indexOf(";") == 1 || resultado.indexOf(";") == 2) {
			var res = resultado.split(';');
			
			if (res[0] == pCodcoligada) {
		   		dataset.addRow(new Array("true","Movimento alterado com sucesso", res[1]));
		   	}
		   	else
	   		{	
		 		dataset.addRow(new Array("false","Movimento nao foi alterado: " + resultado,''));
	   		}
	   	}
	   	else
	   	{
		 	dataset.addRow(new Array("false","Movimento permanece igual" + resultado,''));
	   	}
	}
	catch (e) {
		   
		dataset.addRow(new Array("false",e,''));
	}
	return dataset;

}		

function onMobileSync(user) { }