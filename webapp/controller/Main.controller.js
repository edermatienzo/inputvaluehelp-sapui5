sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("inputvaluehelp.demo.controller.Main", {
			onInit: function () {

            },
            changeODataModel: function(){
                const oModel = this.getView().getModel("localModel");
                oModel.setProperty("/Product", 2);
            },
            changeJSONModel: function(){
                const oModel = this.getView().getModel("localModel");
                oModel.setProperty("/People", 10);
            }            
		});
	});
