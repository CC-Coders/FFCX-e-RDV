function defineStructure() { }
function onSync(lastSyncDate) { }
function createDataset(fields, constraints, sortFields) {

	var pXML,
		pCodcoligada,
		pUsuario = "fluig",
		pPassword = "flu!g@cc#2018",
		pProcessName = "MovFaturamentoProc";
		
	if (constraints != null)
    {
        for (i = 0; i < constraints.length; i++) 
        {
        	if (constraints[i].fieldName == "pXML"){ 
        		pXML = constraints[i].initialValue; 
        	}
        	if(constraints[i].fieldName == "pCodcoligada") {
        		pCodcoligada = constraints[i].initialValue; 
        	}
       }
    }

	log.info("teste pxml faturamovimento: " + pXML);
		
	if (constraints == null) {
		return e("Sem parametros");
	}
			    
	try 
	{
		 var dataset = DatasetBuilder.newDataset();
	     dataset.addColumn("status");
	     dataset.addColumn("msg");	   
	     		    	 
    	 var service = ServiceManager.getService("wsProcessRM");
    	 var serviceHelper = service.getBean();
    	 var serviceLocator = service.instantiate("com.totvs.WsProcess");
    	 var wsObj = serviceLocator.getRMIwsProcess();
		 
    	 var authService = serviceHelper.getBasicAuthenticatedClient(wsObj, "com.totvs.IwsProcess", pUsuario, pPassword);			    	 
    	 var ret = authService.executeWithParams(pProcessName,pXML);		    	 
    	 log.info("test = " + ret)
    	 
    	 if (ret == "1") {
    		dataset.addRow(new Array("true","Nota Fiscal inserida com sucesso"));
    	 }
    	 else {
		 	dataset.addRow(new Array("false",ret));
    	 }
         		
	}
	catch (e) {	   
		dataset.addRow(new Array("false",e));
	}	
    
	return dataset;

}		

function onMobileSync(user) { }