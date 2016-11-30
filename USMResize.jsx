// Open source Project with MIT License 
// Check new version at https://github.com/treebhoph/USMResize-Photoshop
// My Facebook https://www.facebook.com/tong.naja.735
//
//====================================================================
// HOW
//1 Copy USMResize.jsx to folder "presets/script" insides "Adobe Photoshop"  folder.
//2 Lunch Photoshop, Click to a menu "File>Scripts>USMResize"
//====================================================================

var obj = new USMResize();
obj.run();
	
function USMResize( ) {

	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
	app.displayDialogs = DialogModes.NO;

	var props = { stepResize:500, amount:100, radius:0.2, threshold:0 };
	var settings = { isBatchProcessing:false, preferSize:0, separatorDir:'/', inputFolderObj:null};
	var win = null;

	
	 /**
	 *	Entry point function
	 */
	this.run = function() {
		win = new MyUI().getWindow();
		win.batchPanel.visible = win.qualityPanel.visible = settings.isBatchProcessing;
		win.pogressPanel.visible = false;
		win.graphics.backgroundColor = win.graphics.newBrush(win.graphics.BrushType.SOLID_COLOR, [0.31, 0.31, 0.31]); 
	
		var rdoSizes = win.preferSizePanel.preferSizeGroup.children;
		
		win.bottomGroup.btnOK.onClick = function(){
			settings.preferSize = 0;
			
			win.pogressPanel.percentGroup.lblTotal.text = "";
			win.pogressPanel.progressCompleted.value = 0;
			
			var rdoSizeSelected = null;
			for( var i = 0; i < rdoSizes.length; i ++ ) {
				if( rdoSizes[i].value ) {
					if( rdoSizes[i].ref == 0 ) 
						settings.preferSize =  win.preferSizePanel.preferSizeGroup.txtCustomSize.text;
					else
						settings.preferSize = rdoSizes[i].ref;
					
					rdoSizeSelected = rdoSizes[i];
					break;
				}
			}
			
			if(  settings.preferSize == 0 ) {
				alert("Image size is required", "Notice", true);
				
				if( win.preferSizePanel.preferSizeGroup.rdoSize0.value )
					this.active = true;
				
				return;
			}
			
			if( ! isInteger(settings.preferSize) ) {
				alert("Accept Number Only", "Notice", true);
				this.active = true;
				return;
			}
			
			if( ! isInteger(settings.preferSize) ) {
				alert("Accept Number Only", "Notice", true);
				this.active = true;
				return;
			}
			
			props.amount =parseInt(win.USMPanel.amountGroup.slAmount.value) ;
			props.radius = parseFloat(win.USMPanel.radiustGroup.slRadius.value).toFixed(1);
			props.threshold = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
			
			if( settings.inputFolderObj == null ) {
				var doc = app.activeDocument;
				resizeDocument(doc);
			} else {
				win.pogressPanel.visible = true;
				batchResize();
			}
			
			alert("\tF I N I S H \t\t", " ");
			
		}
		
		win.batchPanel.pathGroup.btnSelectInputDir.onClick = function() {
			var inputFolder = Folder.selectDialog("Choose a input folder","Choose a input folder");
			if( inputFolder != null ) {
				settings.inputFolderObj = inputFolder;
				win.batchPanel.pathGroup.txtInputPath.text = inputFolder.path + settings.separatorDir + inputFolder.name;
			}
		}

		win.bottomGroup.btnClose.onClick = function(){
			win.close();
		}
		
		win.chkBatchProcessing.onClick = function(){
			win.batchPanel.visible = win.qualityPanel.visible = settings.isBatchProcessing = win.chkBatchProcessing.value;
			win.layout.resize ();
		}
		
		win.preferSizePanel.preferSizeGroup.size0.onClick = function(){
			win.preferSizePanel.preferSizeGroup.txtCustomSize.active = true;
		}
		
		win.preferSizePanel.preferSizeGroup.txtCustomSize.onActivate = function(){
			win.preferSizePanel.preferSizeGroup.size0.value = true;
		}
		
	
		/**
		* Custom Size
		*/
		win.preferSizePanel.preferSizeGroup.txtCustomSize.addEventListener("keyup", keybordInputFilter_IntNumber);

		win.preferSizePanel.preferSizeGroup.txtCustomSize.addEventListener("blur", function( e ){
			
			if( this.text.length == 0 ) {
				return;
			}
			
			if( parseInt(this.text) == 0 )
				this.text = 2100;
			else if( parseInt(this.text) < 50 )
				this.text = 50;
			
		}); 		
		
		
		
		/**
		* Amount
		*/
		win.USMPanel.amountGroup.slAmount.onChanging = function () {
			win.USMPanel.amountGroup.txtAmount.text = parseInt(win.USMPanel.amountGroup.slAmount.value);
			usmSetting_UpdateUI();
		} 
		
		win.USMPanel.amountGroup.txtAmount.addEventListener("keyup", function( e ){
			keybordInputFilter_IntNumber( e );
			
			if( this.text.length > 0 ) {
				if( parseInt( this.text ) > 500 )
					this.text = 500;
				
				win.USMPanel.amountGroup.slAmount.value = parseInt(this.text);
			}
			
			usmSetting_UpdateUI();
		}); 
		
		win.USMPanel.amountGroup.txtAmount.addEventListener("blur", function( e ){
			if( this.text.length == 0 )
				this.text = 0;
			else if( parseInt(this.text) > 500 )
				this.text = 500;
			
			win.USMPanel.amountGroup.slAmount.value = parseInt(this.text);
			usmSetting_UpdateUI();
		}); 
		
		
		
		/**
		* Radius
		*/
		win.USMPanel.radiustGroup.slRadius.onChanging = function () {
			win.USMPanel.radiustGroup.txtRadius.text = parseFloat(win.USMPanel.radiustGroup.slRadius.value).toFixed(1);
			
			if( this.text.length > 0 )
				win.USMPanel.radiustGroup.slRadius.value = parseInt(this.text);
			
			usmSetting_UpdateUI();
		} 
		
		win.USMPanel.radiustGroup.txtRadius.addEventListener("keyup", function( e ){
			keybordInputFilter_FloatNumber( e );
			
			if( this.text.length > 0 ) {
				if( parseFloat( this.text ) > 10 )
					this.text = 10;
				
				win.USMPanel.radiustGroup.slRadius.value = parseFloat(this.text);
			}
			
			usmSetting_UpdateUI();
		}); 
		
		win.USMPanel.radiustGroup.txtRadius.addEventListener("blur", function( e ){
			if( this.text.length == 0 )
				this.text = 0;
			else if( parseInt(this.text) > 10 )
				this.text = 10;
			
			win.USMPanel.radiustGroup.slRadius.value = parseFloat(this.text);
			usmSetting_UpdateUI();
		}); 
		
		
		/**
		* Threshold
		*/
		win.USMPanel.thresholdGroup.slThreshold.onChanging = function () {
			win.USMPanel.thresholdGroup.txtThreshold.text = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
			usmSetting_UpdateUI();
		} 
		
		win.USMPanel.thresholdGroup.txtThreshold.addEventListener("keyup", function( e ){
			keybordInputFilter_IntNumber( e );
			
			if( this.text.length > 0 ) {
				if( parseInt( this.text ) > 255 )
					this.text = 255;
				
				win.USMPanel.thresholdGroup.slThreshold.value = parseInt(this.text);
			}
			
			usmSetting_UpdateUI();
		}); 
		
		win.USMPanel.thresholdGroup.txtThreshold.addEventListener("blur", function( e ){
			if( this.text.length == 0 )
				this.text = 0;
			else if( parseInt(this.text) > 255 )
				this.text = 255;
			
			win.USMPanel.thresholdGroup.slThreshold.value = parseInt(this.text);
			usmSetting_UpdateUI();
		}); 
		
		
		/**
		* Quality
		*/
		win.qualityPanel.qualityGroup.slQuailty.onChanging = function () {
			win.qualityPanel.qualityGroup.txtQuality.text = parseInt(win.qualityPanel.qualityGroup.slQuailty.value);
		} 
		
		win.qualityPanel.qualityGroup.txtQuality.addEventListener("keyup", function( e ){
			keybordInputFilter_IntNumber( e );
			
			if( this.text.length > 0 ) {
				if( parseInt( this.text ) > 100 )
					this.text = 100;
				
				win.qualityPanel.qualityGroup.slQuailty.value = parseInt(this.text);
			}
		}); 
		
		win.qualityPanel.qualityGroup.txtQuality.addEventListener("blur", function( e ){
			
			if( this.text.length == 0 )
				this.text = 90;
			else if( parseInt(this.text) < 50 )
				this.text = 50;
			else if( parseInt(this.text) > 100 )
				this.text = 100;
			
			win.qualityPanel.qualityGroup.slQuailty.value = parseInt(this.text);
		});
		
		
		/**
		*	USM Settings selection
		*/
		win.USMPanel.presetGroup.preset1.onClick = function(){
			applyUSMSelection(this);
		}
		
		win.USMPanel.presetGroup.preset2.onClick = function(){
			applyUSMSelection(this);
		}
		
		win.USMPanel.presetGroup.preset3.onClick = function(){
			applyUSMSelection(this);
		}
		
		win.USMPanel.presetGroup.preset4.onClick = function(){
			applyUSMSelection(this);
		}
		
	
		win.show();
	}
	
	applyUSMSelection = function( obj ) {
		var settings = obj.setting.split("|");
		
		win.USMPanel.amountGroup.slAmount.value = parseInt(settings[0]);
		win.USMPanel.radiustGroup.slRadius.value = parseFloat(settings[1]);
		win.USMPanel.thresholdGroup.slThreshold.value = parseInt(settings[2]);
			
		win.USMPanel.amountGroup.txtAmount.text = parseInt(win.USMPanel.amountGroup.slAmount.value);
		win.USMPanel.radiustGroup.txtRadius.text = parseFloat(win.USMPanel.radiustGroup.slRadius.value);
		win.USMPanel.thresholdGroup.txtThreshold.text = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
	}
	
	usmSetting_UpdateUI = function(){
		var amount = parseInt(win.USMPanel.amountGroup.slAmount.value);
		var radius = parseFloat(win.USMPanel.radiustGroup.slRadius.value).toFixed(1);
		var threshold = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
		
		win.USMPanel.presetGroup.preset1.value = false;
		win.USMPanel.presetGroup.preset2.value = false; 
		
		
		if( amount == 25 && radius == 0.2 && threshold == 0 ) 
			win.USMPanel.presetGroup.preset1.value = true;
		
		if( amount == 50 && radius == 0.2 && threshold == 0 ) 
			win.USMPanel.presetGroup.preset2.value = true;
		
		if( amount == 100 && radius == 0.2 && threshold == 0 ) 
			win.USMPanel.presetGroup.preset3.value = true;
		
		if( amount == 200 && radius == 0.2 && threshold == 0 ) 
			win.USMPanel.presetGroup.preset4.value = true;
	}
	
	batchResize = function( ) {
		if( settings.inputFolderObj == null ) {
			return;
		}

		var fileList = settings.inputFolderObj.getFiles(/\.(jpg|jpeg|)$/i);
		if( fileList.length == 0 ) {
			return;
		}
		
		
		win.pogressPanel.percentGroup.lblTotal.text = "[ 0 / " + fileList.length + " images ]     ";
		var percentCompleted = 0;
		for( var i = 0; i < fileList.length; i ++ ) {
			var doc = app.open( fileList[i] );
			resizeDocument(doc);
			doc.close(SaveOptions.DONOTSAVECHANGES);
			doc = null;
			
			percentCompleted = parseInt((( i + 1 ) * 100) / fileList.length);
			win.pogressPanel.percentGroup.lblPercent.text = percentCompleted + "%";
			win.pogressPanel.percentGroup.lblTotal.text = "[ "+(i + 1)+" / " + fileList.length + " images ]             ";
			win.pogressPanel.progressCompleted.value = percentCompleted;
		}
		
	}
	
	isInteger = function( x ) { 
		 return (x == parseInt(x));
	} 
	
	
	keybordInputFilter_IntNumber = function( e ) {
		var keyName = e.keyName.toLowerCase();
		if( keyName == "backspace" || keyName == "tab" || keyName == "enter" || keyName == "delete" || keyName == "space" || keyName == "left" || keyName == "right" ) {
			return;
		}
	
		if( ! isInteger(keyName) ) {
			var arrText =  e.target.text.split('');
			var isValid = true;
			var validValue = "";
			for( var i = 0; i < arrText.length; i ++ ) {
					
				if( ! isInteger(arrText[i]) ) {
					isValid = false;
				}else {
					validValue += arrText[i];
				}
			}
				
			if( ! isValid ) {
				if( validValue > 0 )
					e.target.text = parseInt(validValue);
				else
					e.target.text = "";
		
				alert("Accept Number only", "Notice", true);
			}
		
			e.target.active = true;
		} 
		
	}
	
	
	keybordInputFilter_FloatNumber = function( e ) {
		var keyName = e.keyName.toLowerCase();
		if( keyName == "backspace" || keyName == "tab" || keyName == "enter" || keyName == "delete" || keyName == "space" || keyName == "left" || keyName == "right" ) {
			return;
		}
		
		var keyCode = e.keyIdentifier.toLowerCase();
		if( keyCode == "u+002e" ) {
			var text = e.target.text;
			var firstIndex = text.indexOf( "." );
			if(firstIndex > -1) {
				text = text.substr(firstIndex + 1);
				if( text.length > 0 && text.indexOf(".") > -1 ) {
					e.target.text = e.target.text.substr(0, firstIndex + text.indexOf(".") + 1);
				}
				return;
			}
		}
	
		if( ! isInteger(keyName) ) {
			var arrText =  e.target.text.split('');
			var isValid = true;
			var validValue = "";
			for( var i = 0; i < arrText.length; i ++ ) {
				
				if( ! isInteger(arrText[i]) ) {
					isValid = false;
				}else {
					validValue += arrText[i];
				}
			}
				
			if( ! isValid ) {
				if( validValue > 0 )
					e.target.text = parseFloat(validValue);
				else
					e.target.text = "";
		
				alert("Accept Number only", "Notice", true);
			}
		
			e.target.active = true;
		} 
	}
	
	
	resizeDocument = function( doc ){
		if( doc == null ) return;
		
		if( doc.artLayers.length == 0 ) return;
		
		var currSize = doc.width;
		var isLandscape = true;
		
		if( doc.width < doc.height ) {
			currSize = doc.height;
			isLandscape = false;
		}
		
		while( currSize - props.stepResize > settings.preferSize  ) {
			currSize = currSize - props.stepResize;
			if( isLandscape )
				doc.resizeImage(currSize, null, 300, ResampleMethod.BICUBIC);
			else
				doc.resizeImage(null, currSize, 300, ResampleMethod.BICUBIC);
			
			doc.artLayers[0].applyUnSharpMask( props.amount, props.radius, props.threshold );
		}
		
		if( currSize > settings.preferSize ) {
			var different = parseInt(currSize) - parseInt(settings.preferSize);
			different = ((different * 100) / parseFloat(props.stepResize)) / 100;
			if( isLandscape )
				doc.resizeImage(UnitValue(parseInt(settings.preferSize), 'px'), null, 300, ResampleMethod.BICUBIC);
			else
				doc.resizeImage(null, UnitValue(parseInt(settings.preferSize), 'px'), 300, ResampleMethod.BICUBIC);
			
			doc.artLayers[0].applyUnSharpMask( props.amount * different, props.radius * different, props.threshold * different );
		}
		
		//Save Photo
		if( settings.isBatchProcessing ) {
			
			var exportPath = win.batchPanel.pathGroup.txtInputPath.text + settings.separatorDir + "USM_size"+settings.preferSize
			
			if( win.qualityPanel.chkSaveForWeb.value ) {
				exportPath = exportPath + "_web";
			}
			
			var exportFolder = Folder(exportPath);
			
			if( ! exportFolder.exists )
				exportFolder.create();
			
			var exportFilePath = exportPath + settings.separatorDir + doc.name;
			var file = new File(exportFilePath);
			if( win.qualityPanel.chkSaveForWeb.value ) {
				var exportOptions = new ExportOptionsSaveForWeb();
				exportOptions.format = SaveDocumentType.JPEG;
				exportOptions.quality = parseInt(win.qualityPanel.qualityGroup.txtQuality.text);
				exportOptions.interlaced = false; 
				exportOptions.optimized = true;
				exportOptions.transparency = true;
				exportOptions.includeProfile = true;
				
				doc.exportDocument( file, ExportType.SAVEFORWEB, exportOptions );
			} else {
				var saveOptions = new JPEGSaveOptions();
				saveOptions.embedColorProfile = true;
				saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
				saveOptions.matte = MatteType.NONE;
				saveOptions.quality = Math.round((parseInt(win.qualityPanel.qualityGroup.txtQuality.text) * 12) / 100.00);
				doc.saveAs( file, saveOptions, true, Extension.LOWERCASE );
			}
			
			file = null;
			
		}
		
	}
	
	this.saveAsTextFile = function(filePath, content) {
		    var saveFile = new File(filePath);

		    saveFile.encoding = "UTF8";
		    saveFile.open("w");
		    if (saveFile.error != "")
			  return saveFile.error;

		    saveFile.write(content);
		    if (saveFile.error != "")
			  return saveFile.error;

		    saveFile.close();
		    if (saveFile.error != "")
			  return saveFile.error;

		    return "";
	}	
		
}

function MyUI() {
	this.getWindow = function() {
		var res = "dialog {  \
			orientation: 'column', \
			alignChildren: ['fill', 'top'],  \
			preferredSize:[300, 130], \
			text: 'USM Resize',  \
			margins:15, \
			properties:{resizeable:false}, \
			preferSizePanel: Panel { \
				orientation: 'row', \
				margins:15, \
				text: ' Resize to ', \
				properties: {borderStyle:'black',},\
				preferSizeGroup: Group { \
					orientation: 'row', \
					size1:RadioButton{ text:'800px', ref:800 }, \
					size2:RadioButton{ text:'960px', ref:960 }, \
					size3:RadioButton{ text:'1200px', ref:1200, value:true }, \
					size4:RadioButton{ text:'1800px', ref:1800 }, \
					size0:RadioButton{ text:'', ref:0 }, \
					txtCustomSize: EditText { characters:5, properties:{readonly:false}, justify:'right' }, \
					lblCustomSizePx: StaticText { text: 'px' }, \
				}\
			}, \
			USMPanel: Panel { \
				orientation: 'column', \
				alignChildren: 'left', \
				margins:15, \
				text: ' Unsharp Mask Settings', \
				properties: {borderStyle:'black',},\
				amountGroup : Group { \
					lblAmount: StaticText { text: 'Amount    :' }, \
					slAmount: Slider { minvalue:1, maxvalue:500, value:100, size:[260,12] }, \
					txtAmount: EditText { text:'100', characters:4, properties:{readonly:false}, justify:'right'} \
				}\
				radiustGroup : Group { \
					lblRadius: StaticText { text: 'Radius      :' }, \
					slRadius: Slider { minvalue:0.1, maxvalue:10, value:0.2, size:[260,12] }, \
					txtRadius: EditText { text:'0.2', characters:4, properties:{readonly:false}, justify:'right'} \
				}\
				thresholdGroup : Group { \
					lblThreshold: StaticText { text: 'Threshold :' }, \
					slThreshold: Slider { minvalue:0, maxvalue:255, value:0, size:[260,12] }, \
					txtThreshold: EditText { text:'0', characters:4, properties:{readonly:false}, justify:'right'} \
				}\
				presetGroup: Group { \
					orientation: 'row', \
					preset1:RadioButton{ text:'Portrait Soft', setting:'25|0.2|0', value:false }, \
					preset2:RadioButton{ text:'Portrait Hard', setting:'50|0.2|0', value:false }, \
					preset3:RadioButton{ text:'Landscape Soft', setting:'100|0.2|0', value:true }, \
					preset4:RadioButton{ text:'Landscape Hard',  setting:'200|0.2|0', value:false }, \
				}\
			},\
			chkBatchProcessing: Checkbox { text:'Batch Resize' }, \
			batchPanel: Panel { \
				orientation: 'column', \
				alignChildren: 'left', \
				margins:15, \
				text: ' Image Folder ', \
				properties: {borderStyle:'black',},\
				pathGroup: Group {\
					orientation: 'row', \
					lblInputPath: StaticText { text:'Image Folder' }, \
					txtInputPath: EditText { characters:25, properties:{readonly:true} }, \
					btnSelectInputDir: Button { text:'...', size: [60,35] }, \
				}, \
			}, \
			qualityPanel: Panel { \
				orientation: 'column', \
				alignChildren: 'left', \
				margins:15, \
				text: ' Export files options ', \
				properties: {borderStyle:'black',},\
				qualityGroup : Group { \
					lblQuality: StaticText { text: 'Image Quality' }, \
					slQuailty: Slider { minvalue:50, maxvalue:100, value:80, size:[240,10] }, \
					txtQuality: EditText { text:'90', characters:4, properties:{readonly:false}, justify:'right'} \
					lblQualityPercent: StaticText { text: '%' }, \
				}\
				chkSaveForWeb: Checkbox { text:'Save For Web', value:true }, \
			},\
			pogressPanel: Group { \
				orientation: 'column', \
				alignChildren: 'right', \
				percentGroup : Group { \
					lblPercent: StaticText { text: '    0%' }, \
					lblTotal:StaticText{text:'[    0 / 0    images   ]'},\
				}\
				progressCompleted:Progressbar{size:[410,15], value:0}\
			},\
			bottomGroup: Group{ \
				btnOK: Button { text: 'Start', size: [120,40], alignment:['right', 'center'] }, \
				btnClose: Button { text: 'Close', properties:{name:'cancel'}, size: [120,40], alignment:['right', 'center'] }, \
			}\
		}";
		
		return new Window(res);
	}
}
