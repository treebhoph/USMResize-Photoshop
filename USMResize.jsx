//http://jongware.mit.edu/iljscs6html/iljscs6/pc_Window%20(SUI).html
var obj = new USMResize();
obj.resize();
	
function USMResize( ) {

	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
	app.displayDialogs = DialogModes.NO;

	var props = { stepResize:500, amount:200, radius:0.2, threshold:0 };
	var settings = { isBatchProcessing:false, preferSize:0, separatorDir:'/', inputFolderObj:null};
	var win = null;
	
	this.resize = function() {
		win = new MyUI().getWindow();
		win.batchPanel.visible = win.qualityPanel.visible = settings.isBatchProcessing;
		win.pogressPanel.visible = false;
		win.graphics.backgroundColor = win.graphics.newBrush(win.graphics.BrushType.SOLID_COLOR, [0.9, 0.9, 0.9]); 
		var rdoSizes = win.preferSizePanel.preferSizeGroup.children;
		
		win.batchPanel.pathGroup.btnSelectInputDir.onClick = function() {
			var inputFolder = Folder.selectDialog("Choose a input folder","Choose a input folder");
			if( inputFolder != null ) {
				settings.inputFolderObj = inputFolder;
				win.batchPanel.pathGroup.txtInputPath.text = inputFolder.path + settings.separatorDir + inputFolder.name;
			}
		}
		
		win.bottomGroup.btnOK.onClick = function(){
			settings.preferSize = 0;
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
		
		win.preferSizePanel.preferSizeGroup.txtCustomSize.addEventListener("changing", function(k){
			if( ! isInteger(this.text) ) {
				alert("Accept Number Only", "Notice", true);
				this.active = true;
			}
		}); 
		
		win.qualityPanel.qualityGroup.slQuailty.onChanging = function () {
			win.qualityPanel.qualityGroup.txtQuality.text = parseInt(win.qualityPanel.qualityGroup.slQuailty.value);
		} 
		
		
		win.qualityPanel.qualityGroup.txtQuality.addEventListener("keydown", function(k){
			
		}); 
		
		win.qualityPanel.qualityGroup.txtQuality.onChanging = function( e ){
			//alert(win.qualityPanel.qualityGroup.txtQuality.text);
		}
		
		
		
		win.USMPanel.amountGroup.slAmount.onChanging = function () {
			win.USMPanel.amountGroup.txtAmount.text = parseInt(win.USMPanel.amountGroup.slAmount.value);
			usmSettingsChanged();
		} 
		
		win.USMPanel.radiustGroup.slRadius.onChanging = function () {
			win.USMPanel.radiustGroup.txtRadius.text = parseFloat(win.USMPanel.radiustGroup.slRadius.value).toFixed(1);
			usmSettingsChanged();
		} 
		
		win.USMPanel.thresholdGroup.slThreshold.onChanging = function () {
			win.USMPanel.thresholdGroup.txtThreshold.text = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
			usmSettingsChanged();
		} 
		
		win.USMPanel.presetGroup.preset1.onClick = function(){
			win.USMPanel.amountGroup.slAmount.value = 200;
			win.USMPanel.radiustGroup.slRadius.value = 0.2;
			win.USMPanel.thresholdGroup.slThreshold.value = 0;
			
			win.USMPanel.amountGroup.txtAmount.text = parseInt(win.USMPanel.amountGroup.slAmount.value);
			win.USMPanel.radiustGroup.txtRadius.text = parseFloat(win.USMPanel.radiustGroup.slRadius.value);
			win.USMPanel.thresholdGroup.txtThreshold.text = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
		}
		
	
		win.show();
	}
	
	usmSettingsChanged = function(){
		var amount = parseInt(win.USMPanel.amountGroup.slAmount.value);
		var radius = parseFloat(win.USMPanel.radiustGroup.slRadius.value).toFixed(1);
		var threshold = parseInt(win.USMPanel.thresholdGroup.slThreshold.value);
		
		if( amount == 200 && radius == 0.2 && threshold == 0 )
			win.USMPanel.presetGroup.preset1.value = true;
		else
			win.USMPanel.presetGroup.preset1.value = false;
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
			win.pogressPanel.percentGroup.lblTotal.text = "[ "+(i + 1)+" / " + fileList.length + " images ]     ";
			win.pogressPanel.progressCompleted.value = percentCompleted;
		}
		
	}
	
	isInteger = function( x ) { 
		 return (x == parseInt(x));
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
					slAmount: Slider { minvalue:1, maxvalue:500, value:200, size:[260,12] }, \
					txtAmount: EditText { text:'200', characters:4, properties:{readonly:true}, justify:'right'} \
				}\
				radiustGroup : Group { \
					lblRadius: StaticText { text: 'Radius      :' }, \
					slRadius: Slider { minvalue:0.1, maxvalue:10, value:0.2, size:[260,12] }, \
					txtRadius: EditText { text:'0.2', characters:4, properties:{readonly:true}, justify:'right'} \
				}\
				thresholdGroup : Group { \
					lblThreshold: StaticText { text: 'Threshold :' }, \
					slThreshold: Slider { minvalue:0, maxvalue:255, value:0, size:[260,12] }, \
					txtThreshold: EditText { text:'0', characters:4, properties:{readonly:true}, justify:'right'} \
				}\
				presetGroup: Group { \
					orientation: 'row', \
					preset1:RadioButton{ text:'Default Setting', ref:1, value:true }, \
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
				lblOutputPath: StaticText { text:'' }, \
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
					txtQuality: EditText { text:'90', characters:4, properties:{readonly:true}, justify:'right'} \
					lblQualityPercent: StaticText { text: '%' }, \
				}\
				chkSaveForWeb: Checkbox { text:'Save For Web', value:true }, \
			},\
			pogressPanel: Group { \
				orientation: 'column', \
				alignChildren: 'right', \
				percentGroup : Group { \
					lblPercent: StaticText { text: ' 0%' }, \
					lblTotal:StaticText{text:'[ 0 / 0 images ]'},\
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
	
	