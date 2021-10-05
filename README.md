# inputvaluehelp-sapui5

inputvaluehelp-sapui5 is a custom control based on SAPUI5 Input control with extended features like Value Help Dialog and Suggestions, compatible with JSONModel and ODataModel.

![](demo.webm)

## Installation

Copy /webapp/control/InputValueHelp.js and /webapp/style.css in your project.


## Usage
Add namespace in view.xml
```xml
<mvc:View
    controllerName="inputvaluehelp.demo.controller.Main"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:ic="inputvaluehelp.demo.control"
    displayBlock="true"
    xmlns="sap.m"
>
```
Add control in view.xml
```xml
...
<ic:InputValueHelp 
  placeholder="{i18n>SelectProduct}"
  value="{localModel>/Product}"
  showSuggestion="true"
  helpModel="ODataModel" 
  helpEntitySet="Products" 
  helpDescriptionField="ProductName" 
  helpKeyField="ProductID" 
  dialogTitle="{i18n>dialogTitle}"
  width="22rem"
/>
```
## Properties
- **helpModel**: JSON or OData model
- **helpEntitySet**: Model Entity Set
- **helpDescriptionField**: Description Field, this field will be added as suggestion text, and displayed on the right side.
- **helpKeyField**: Key Field, this field is assigned to value property when a selection is made, displayed on the left side.
- **dialogTitle**: Dialog Title for Select Dialog



## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)