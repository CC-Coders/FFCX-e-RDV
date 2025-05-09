function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {

	var pIdmov = '';
	var pCodColigada = '';

	if (constraints != null) {
		for (i = 0; i < constraints.length; i++) {
			if (constraints[i].fieldName == "IDMOV") {
				pIdmov = constraints[i].initialValue;

				log.warn("man,: " + pIdmov);
			}
			if (constraints[i].fieldName == "CODCOLIGADA") {
				pCodColigada = constraints[i].initialValue;
			}
		}


		try {

			// log.info("IDMOVIMENTO = "+pIdmov);
			// 'WSRMReports' é o identificador utilizado no cadastro do Web Service do RM Reports no Fluig
			const SERVICE_STUB = ServiceManager.getService('wsReportsRM'); // Cria o objeto de Integração
			//log.info("wsProjetos-> SERVICE_STUB: " + SERVICE_STUB);
			const SERVICE_HELPER = SERVICE_STUB.getBean();

			// Cria o obejto da classe principal do Servico
			const wsReport = SERVICE_HELPER.instantiate('com.totvs.WsReport');
			// log.info("wsProjetos-> wsReport: " + wsReport);

			// Obtem o objeto do WS
			var iWsReport = wsReport.getRMIwsReport();
			//log.info("wsProjetos-> iWsReport: " + iWsReport);

			// Usuário e senha para autenticação no RM
			var rm_user = 'fluig';
			var rm_pass = 'flu!g@cc#2018';

			var authIwsDataServer = SERVICE_STUB.getBasicAuthenticatedClient(iWsReport, 'com.totvs.IwsReport', rm_user, rm_pass);
			// log.info("wsProjetos-> authIwsDataServer: " + authIwsDataServer);

			//XML de parâmetros recuperado pelo Web Service do RM Reports (teste - IDMOV = 640075)
			var filtros = '<?xml version="1.0" encoding="utf-16"?>' +
				'<ArrayOfRptFilterReportPar xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.totvs.com.br/RM/">' +
				'<RptFilterReportPar>' +
				'<BandName>RptReport</BandName>' +
				'<FiltersByTable />' +
				'<MainFilter>true</MainFilter>' +
				'<Value>(TMOV.IDMOV = ' + pIdmov + ')</Value>' +
				'</RptFilterReportPar>' +
				'</ArrayOfRptFilterReportPar>';

			//log.info("XML REPORTS" + filtros);

			// XML de parâmetros recuperado pelo Web Service do RM Reports
			var parametros = "";
			var NomeRelatorio = "Fundo Fixo.pdf";

			// dados de cadastro relatório
			var CodigoColigadaRel = pCodColigada;

			// CONSTRUTORA CASTILHO
			if (CodigoColigadaRel == "1" || CodigoColigadaRel == 1) {
				// HOMOLOGACAO
				var IdRelatorio = 218; // NU003.01 - Fundo Fixo
				//var IdRelatorio = 171; // NU003.01 - Fundo Fixo
				
			} else if (CodigoColigadaRel == "2" || CodigoColigadaRel == 2) {
				var IdRelatorio = 319; // NU003.01 - Fundo Fixo
			} else if (CodigoColigadaRel == "12" || CodigoColigadaRel == 12) {
				var IdRelatorio = 10018; // NU003.01 - Fundo Fixo
			} else{
				var IdRelatorio = 0;
			}

			// solicita a geração do realtório e armazena o identificador único

			var guid = authIwsDataServer.generateReport(parseInt(CodigoColigadaRel), IdRelatorio, filtros, parametros, NomeRelatorio); //contexto

			// recupera o tamanho do relatório gerado
			var size = authIwsDataServer.getGeneratedReportSize(guid);


			//log.info("RESULT size = "+size);

			var offset = 0;
			var rptstr = "";
			var pack = 65000;

			// monta o arquivo com o relatório gerado
			while (offset < size) {
				var temp = pack;
				if ((offset + temp) > size)
					temp = size - offset;

				rptstr += authIwsDataServer.getFileChunk(guid, offset, temp);
				//log.info("RESULT getFileChunk = " + rptstr);

				offset = offset + pack;
			}

			result = rptstr;

			// result = authIwsDataServer.getFileChunk(guid, offset, size);

			//log.info("Resultado do Servico: " + result);

			//O TBC retorna os valores da chave caso o registro tenha sido salvo,
			//caso contrário, a exceção ocorrida é enviada pelo mesmo retorno, porém
			//formatada entre linhas '==='

			var dataset = DatasetBuilder.newDataset();

			dataset.addColumn("STATUS");
			dataset.addColumn("RELATORIO");

			if ((result != null) && (result.indexOf("===") != -1)) {
				//log.info("Erro no serviço.");
				var msgErro = result.substring(0, result.indexOf("==="));
				//log.info(msgErro);
				dataset.addRow(new Array(false, msgErro));
				throw msgErro;
			}
			else {
				dataset.addRow(new Array(true, result));
			}

			return dataset;

		} catch (e) {
			return getDatasetError(e);
		};
	}
	else {
		return;
	}
}

function getDatasetError(exception) {
	var dtsError = DatasetBuilder.newDataset();
	dtsError.addColumn("ERROR");
	dtsError.addRow(["Ocorreu um erro na execução do DataSet. Mensagem: " + exception]);
	return dtsError;

}; function onMobileSync(user) {

}