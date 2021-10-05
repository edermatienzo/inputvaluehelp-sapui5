/* InputValueHelp-SAPUI5 -- https://github.com/edermatienzo/inputvaluehelp-sapui5*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Input",
	"sap/m/InputBase",
	"sap/m/Label",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/SelectDialog"
], function (Control, Input, InputBase, Label, Filter, FilterOperator, SelectDialog) {
	"use strict";

	return Input.extend("inputvaluehelp-sapui5.InputValueHelp", {

		metadata: {
			properties: {
				value: {
					type: "string",
					defaultValue: ""
				},
				text: {
					type: "string",
					defaultValue: ""
				},
				showValueHelp: {
					type: "boolean",
					defaultValue: true
				},
				helpModel: {
					type: "string",
					defaultValue: ""
				},
				helpEntitySet: {
					type: "string",
					defaultValue: ""
				},
				helpDescriptionField: {
					type: "string",
					defaultValue: ""
				},
				helpKeyField: {
					type: "string",
					defaultValue: ""
				},
				helpText: {
					type: "string",
					defaultValue: ""
				},
				dialogTitle: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				_label: {
					type: "sap.m.Label",
					multiple: false,
					visibility: "hidden"
				},
				_dialog: {
					type: "sap.m.SelectDialog",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				"helpSelect": {
					allowPreventDefault: false,
					parameters: {
						"selectedItem": {
							type: "object"
						}
					}
				},
				"afterChange": {
					allowPreventDefault: false
				},
				"beforeHelpRequest": {
					allowPreventDefault: false
				}
			},
			renderer: null
		},
		beforeFilter: null,
		init: function () {
			this._cache = {};
			Input.prototype.init.call(this);

			this.attachLiveChange(this.onLiveChange);
			this.attachChange(this.onChange);
			this.addStyleClass("inputValueHelp");
			this.addStyleClass("containerValueHelp");

			this.setAggregation("_label", new Label({
				text: ""
			}).addStyleClass("sapUiTinyMargin labelValueHelp"));

			var that = this;
			this.setAggregation("_dialog", new SelectDialog({
				title: that.getDialogTitle(),
				confirm: function (oEvent) {
					var oSelectedItem = oEvent.getParameter("selectedItem")
					that.setHelpText(oSelectedItem.getDescription());
					that.setValue(oSelectedItem.getTitle());
					that._cache[oSelectedItem.getTitle()] = oSelectedItem.getDescription();

					that.fireEvent("helpSelect", {
						selectedItem: oSelectedItem
					});

					that.fireEvent("afterChange", {});
				},
				cancel: function (oCancelEvent) {
					//that.closeDialogMatnrItems(oCancelEvent);
				},
				search: function (oEvt) {

					var sValue = oEvt.getParameter("value");
					if (!sValue || sValue === "") {
						this.getBinding("items").filter([]);
					} else {
                        var _aFilters = [];
                        const oModel = this.getModel(that.getHelpModel())
                        if (oModel.sServiceUrl){
                            const aProperties = oModel.oMetadata._getEntityTypeByPath(that.getHelpEntitySet()).property
                            const sBindingPath = that.getHelpKeyField();
                            const oProperty = aProperties.find(e => e.name == sBindingPath);

                            if (oProperty.type == "Edm.String"){
                                _aFilters.push(new Filter(that.getHelpKeyField(), FilterOperator.Contains, sValue));
                            }else{
                                if (sValue.match(/^\d+/)){
                                    _aFilters.push(new Filter(that.getHelpKeyField(), FilterOperator.EQ, sValue));
                                }
                            }         
                        }else{
                            const sType = typeof oModel.getProperty("/" + that.getHelpEntitySet())[0][that.getHelpKeyField()]
                            if (sType == "string"){
                                _aFilters.push(new Filter(that.getHelpKeyField(), FilterOperator.Contains, sValue));
                            }else{
                                if (sValue.match(/^\d+/)){
                                    _aFilters.push(new Filter(that.getHelpKeyField(), FilterOperator.EQ, sValue));
                                }
                            }
                        }
               

						if (that.getHelpDescriptionField() !== "") {
							_aFilters.push(new Filter(that.getHelpDescriptionField(), FilterOperator.Contains, sValue));
						}

						var aFilters = new Filter({
							filters: _aFilters,
							and: false
						});

						this.getBinding("items").filter(aFilters);
					}

				}
			}))

			this.attachSuggest(this.onSuggest);
			this.attachSuggestionItemSelected(this.onSuggestionItemSelected);
			//this.attachOnSelect(this.onSelect);
		},
		attachBeforeFilter: function (callback) {
			this.beforeFilter = callback;
		},
		onSuggestionItemSelected: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			this.setValue(oSelectedItem.getText());
			this.fireEvent("afterChange", {});

		},
		onLiveChange: function (oEvent) {
			if (oEvent.getParameter("newValue") === "") {
				this.setValueState("None")
				this.setHelpText("")
				this.getBinding("value").setValue("")
			}
		},
		setHelpText: function (sValue) {
			this.getAggregation("_label").setText(sValue);
			this.setText(sValue);
		},
		getHelpText: function (sValue) {
			return this.getAggregation("_label").getText();
		},
		renderer: function (oRm, oInput) {
			oRm.write("<div style='width:" + oInput.getWidth() + "'");
			oRm.writeControlData(oInput);
			oRm.writeClasses();
			oRm.write(">");

			sap.m.InputRenderer.render(oRm, oInput);
			oRm.renderControl(oInput.getAggregation("_label"));
			oRm.write("</div>");
		},
		onModelPropertyChange: function (oEvent) {
			if (oEvent.getParameter("path") === "/" + this.getHelpEntitySet()) {
				this.onChange({
					sId: "propertyChange"
				});
			}
		},
		onAfterRendering: function () {

			if (this.loaded) {
				return
			}
			this.loaded = true;
			if (sap.ui.core.Control.prototype.onAfterRendering) {
				sap.ui.core.Control.prototype.onAfterRendering.apply(this, arguments); //run the super class's method first
				this.onChange({
					sId: "afterRendering"
				});

				var oModel = this.getModel(this.getHelpModel());
				oModel.attachPropertyChange(this.onModelPropertyChange, this)

				var oBinding = this.getBinding("value");

				if (oBinding) {
					oBinding.attachChange(this.onChange, this);
				}


				var sPath = this.getHelpModel() + ">/" + this.getHelpEntitySet()
				this.bindAggregation("suggestionItems", {
					path: sPath,
					template: new sap.ui.core.ListItem({
						text: "{" + this.getHelpModel() + ">" + this.getHelpKeyField() + "}",
						additionalText: this.getHelpDescriptionField() !== "" ? "{" + this.getHelpModel() + ">" + this.getHelpDescriptionField() +
							"}" : ""
					})
				});

				if (!this.hasListeners("valueHelpRequest")) {
					this.attachValueHelpRequest(this.onValueHelpRequest);
				}
			}
		},
		onSuggest: function (oEvent) {
			var oControl = oEvent.getSource();
			var oTemplate = oControl.getBindingInfo("suggestionItems").template;

			var aFilters = [];
			var sTerm = oEvent.getParameter("suggestValue");
			if (sTerm) {
                
                const oModel = this.getModel(this.getHelpModel())
                if (oModel.sServiceUrl){
                    const aProperties = oModel.oMetadata._getEntityTypeByPath(this.getHelpEntitySet()).property
                    const sBindingPath = oTemplate.getBindingPath("text");
                    const oProperty = aProperties.find(e => e.name == sBindingPath);

                    if (oProperty.type == "Edm.String"){
                        aFilters.push(new Filter(oTemplate.getBindingPath("text"), FilterOperator.Contains, sTerm));
                    }else{
                        if (sTerm.match(/^\d+/)){
                            aFilters.push(new Filter(oTemplate.getBindingPath("text"), FilterOperator.EQ, sTerm));
                        }
                    }
                }else{
                    const sType = typeof oModel.getProperty("/" + this.getHelpEntitySet())[0][this.getHelpKeyField()]
                    if (sType == "string"){
                        aFilters.push(new Filter(oTemplate.getBindingPath("text"), FilterOperator.Contains, sTerm));
                    }else{
                        if (sTerm.match(/^\d+/)){
                            aFilters.push(new Filter(oTemplate.getBindingPath("text"), FilterOperator.EQ, sTerm));
                        }
                    }                    
                }


				if (oTemplate.getBindingPath("additionalText")) {
					aFilters.push(new Filter(oTemplate.getBindingPath("additionalText"), FilterOperator.Contains, sTerm));
				}
			}
			oEvent.getSource().getBinding("suggestionItems").filter(new Filter({
				filters: aFilters,
				and: false
			}));
			oEvent.getSource().setFilterSuggests(false);
		},
		onChange: function (oEvent) {
			if (oEvent && oEvent.type) {
				this.getBinding("value").setValue(this.getValue());
			}

			if (sap.ui.core.Control.prototype.onChange) {
				sap.ui.core.Control.prototype.onChange.apply(this, arguments); //run the super class's method first
			}
			console.log(oEvent)

			var sValue = this.getValue();
			if (sValue === "") {
				this.setValueState("None")
				this.setHelpText("")
				this.getBinding("value").setValue("")
			} else {
				if (this._cache[sValue]) {
					this.setValueState("None")
					this.setHelpText(this._cache[sValue]);
				} else {
					var that = this;
					var oModel = this.getModel(this.getHelpModel());

					if (!oModel.sServiceUrl) {
						var col = oModel.oData[this.getHelpEntitySet()]
						if (col) {
							var oEntry = col.find(e => e[this.getHelpKeyField()] == sValue);
							if (oEntry) {
								that.setValueState("None")
								that.setHelpText(oEntry[that.getHelpDescriptionField()])
							} else {
								that.setValueState("Error")
								that.setHelpText("")

								setTimeout(function () {
									that.getBinding("value").setValue("");
									that.setValue("")
								})
							}
							that._cache[sValue] = that.getHelpText();
						}

					} else {
						this.getAggregation("_label").setBusy(true);
						var oFilter = new Filter(this.getHelpKeyField(), "EQ", sValue);

						oModel.read("/" + this.getHelpEntitySet(), {
							filters: [oFilter],
							success: function (data) {
								that.getAggregation("_label").setBusy(false);
								if (data.results.length !== 0) {
									that.setValueState("None")
									that.setHelpText(data.results[0][that.getHelpDescriptionField()])
								} else {
									that.setValueState("Error")
									that.setHelpText("")
									setTimeout(function () {
										that.getBinding("value").setValue("");
										that.setValue("")
									})
								}
							},
							error: function (error) {
								that.getAggregation("_label").setBusy(false);
								that.setHelpText("");
								that.setValueState("Error")
								setTimeout(function () {
									that.getBinding("value").setValue("");
									that.setValue("")
								})
							}
						});

					}

				}
			}

		},
		openValueHelp: function () {

			if (this.beforeFilter) {
				this.beforeFilter();
			} else {
				this.aFilters = [];
			}

			var oDialog = this.getAggregation("_dialog")
			if (this._dialogLoaded) {
				oDialog.getBinding("items").filter(this.aFilters);

			} else {
				var oTemplate = new sap.m.StandardListItem("DialogItems" + this.getId(), {
					title: "{" + this.getHelpKeyField() + "}",
					description: this.getHelpDescriptionField() !== "" ? "{" + this.getHelpDescriptionField() + "} " : ""
				});
				oDialog.setTitle(this.getDialogTitle());
				oDialog.setModel(this.getModel(this.getHelpModel()));
				oDialog.bindAggregation("items", {
					path: "/" + this.getHelpEntitySet(),
					filters: this.aFilters,
					template: oTemplate
				});
				this._dialogLoaded = true;
			}
			oDialog.open();
		},
		onValueHelpRequest: function (oEvent) {
			this.openValueHelp();
		},
		onSelect: function (oEvent) {

		}
	});
});