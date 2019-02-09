
const similarity = require('./similarity.js');

module.exports = {};
module.exports.getFeatures = (globalFeatures) => {
    const featuresArray = globalFeatures.map((feature, index) => {
        const id = index + 1;
        return "new Feature { Id = " + id + ", Name = \"" + feature + "\" }";
    });
    return featuresArray.join(",\n");
}

module.exports.getRecords = (records) => records.map(getRecord).join(',\n');

module.exports.getRecordsFeatures = (records) => records.map(getRecordFeatures).join(',\n');

var recordFeatureIndex = 25747;

var getRecordFeatures = (record) => {
    return record['featuresIds'].map(featureId => getRecordFeature(record['id'], featureId)).join(',\n');
}

var getRecordFeature = (recordId, featureId) => {
    return 'new RecordFeature { ' + 
        'Id = ' + recordFeatureIndex++ + 
        ', RecordId = ' + recordId + 
        ', FeatureId = ' + featureId + '}';
}

var getRecord = (record) => {
    var id = getId(record);
    var modelId = getModelId(record);
    var manufactureDate = getManufactureDate(record);
    var distance = getDistance(record);
    var emissionStandard = getEmissionStandard(record);
    var fuel = getFuel(record);
    var gearBox = getGearBox(record);
    var engineSize = getEngineSize(record);
    var power = getPower(record);
    var body = getBody(record);
    var transmission = getTransmission(record);
    var doorsNo = getDoorsNo(record);
    var color = getColor(record);
    var countryOfOrigin = getCountryOfOrigin(record);
    var registered = getRegistered(record);
    var condition = getCondition(record);
    var seller = getSeller(record);
    var vin = getVIN(record);
    var price = getPrice(record);

    return 'new Record { ' + 
        'Id = ' + id + ', ' +
        'ModelId = ' + modelId + ', ' +
        'ManufactureDate = ' + manufactureDate + ', ' +
        'Distance = ' + distance + ', ' +
        'EmissionStandard = ' + emissionStandard + ', ' +
        'Fuel = ' + fuel + ', ' +
        'GearBox = ' + gearBox + ', ' +
        'EngineSize = ' + engineSize + ', ' +
        'Power = ' + power + ', ' +
        'Body = ' + body + ', ' +
        'Transmission = ' + transmission + ', ' +
        'DoorsNo = ' + doorsNo + ', ' +
        'Color = ' + color + ', ' +
        'CountryOfOrigin = ' + countryOfOrigin + ', ' +
        'Registered = ' + registered + ', ' +
        'Condition = ' + condition + ', ' +
        'Seller = ' + seller + ', ' +
        'VIN = ' + vin + ', ' +
        'Price = ' + price +
        '}'
}

var getId = (record) => record['id'];

var getModelId = (record) => {
    if(record['Model'] == null) { console.log("Model null on id " + record['id']); return 'null'}
    return similarity.getMostSimilarModelId(record['Model']);
};

var getManufactureDate = (record) => {
    if(record['Anul fabricatiei'] == null) { console.log("Anul fabricatiei null on id " + record['id']); return 'null'}
    return 'new DateTime(' + record['Anul fabricatiei'] + ', 1, 1)';
};

var getDistance = (record) => {
    if(record['Km'] == null) { console.log("Km null on id " + record['id']); return 'null'}
    return record['Km'];
};

var getEmissionStandard = (record) => {
    if(record['Norma de poluare'] == null) { console.log("Norma de poluare null on id " + record['id']); return 'null'}

    switch(record['Norma de poluare']){
        case 'Euro 3': 
            return 'EmissionStandard.Euro3';
        case 'Euro 4': 
            return 'EmissionStandard.Euro4';
        case 'Euro 5': 
            return 'EmissionStandard.Euro5';
        case 'Euro 6': 
            return 'EmissionStandard.Euro6';
        default:
            console.log("Norma de poluare \"" + record['Norma de poluare'] + "\" not in range on id " + record['id']); 
            return 'null'
    }
};

var getFuel = (record) => {
    if(record['Combustibil'] == null) { console.log("Combustibil null on id " + record['id']); return 'null'}

    switch(record['Combustibil']){
        case 'Diesel': 
            return 'FuelType.Diesel';
        case 'Benzina': 
            return 'FuelType.Gasoline';
        case 'Electric': 
            return 'FuelType.Electric';
        case 'Benzina + GPL': 
            return 'FuelType.GPL';
        case 'Hibrid': 
            return 'FuelType.Hibrid';
        default:
            console.log("Combustibil \"" + record['Combustibil'] + "\" not in range on id " + record['id']); 
            return 'null'
    }
};

var getGearBox = (record) => {
    if(record['Cutie de viteze'] == null) { console.log("Cutie de viteze null on id " + record['id']); return 'null'}

    switch(record['Cutie de viteze']){
        case 'Manuala': 
            return 'GearBoxType.Manual';
        case 'Automata': 
        case 'Automata (CVT)': 
        case 'Automata (dublu ambreiaj)': 
            return 'GearBoxType.Auto';
        default:
            console.log("Cutie de viteze \"" + record['Cutie de viteze'] + "\" not in range on id " + record['id']); 
            return 'null'
    }
};

var getEngineSize = (record) => {
    if(record['Capacitate cilindrica'] == null) { console.log("Capacitate cilindrica null on id " + record['id']); return 'null'}
    return record['Capacitate cilindrica'];
};

var getPower = (record) => {
    if(record['Putere'] == null) { console.log("Putere null on id " + record['id']); return 'null'}
    return record['Putere'];
};

var getPrice = (record) => {
    if(record['price'] == null) { console.log("price null on id " + record['id']); return 'null'}
    return record['price'];
};

var getBody = (record) => {
    if(record['Caroserie'] == null) { console.log("Caroserie null on id " + record['id']); return 'null'}

    switch(record['Caroserie']){
        case 'Masina mica': 
            return 'BodyType.MasinaMica';
        case 'Masina de oras': 
            return 'BodyType.MasinaDeOras';
        case 'Masina mica': 
            return 'BodyType.MasinaMica';
        case 'Compacta': 
            return 'BodyType.Compacta';
        case 'Sedan': 
            return 'BodyType.Sedan';
        case 'Combi': 
            return 'BodyType.Combi';
        case 'Monovolum': 
            return 'BodyType.Monovolum';
        case 'SUV': 
            return 'BodyType.SUV';
        case 'Cabrio': 
            return 'BodyType.Cabrio';
        case 'Coupe': 
            return 'BodyType.Coupe';
        default:
            console.log("Caroserie \"" + record['Caroserie'] + "\" not in range on id " + record['id']); 
            return 'null'
    }
};

var getTransmission = (record) => {
    if(record['Transmisie'] == null) { console.log("Transmisie null on id " + record['id']); return 'null'}
    return "\"" + record['Transmisie'] + "\"";
};

var getDoorsNo = (record) => {
    if(record['Numar de portiere'] == null) { console.log("Numar de portiere null on id " + record['id']); return 'null'}
    return record['Numar de portiere'];
};

var getColor = (record) => {
    if(record['Culoare'] == null) { console.log("Culoare null on id " + record['id']); return 'null'}
    return "\"" + record['Culoare'] + "\"";
};

var getCountryOfOrigin = (record) => {
    if(record['Tara de origine'] == null) { console.log("Tara de origine null on id " + record['id']); return 'null'}
    return "\"" + record['Tara de origine'] + "\"";
};

var getRegistered = (record) => {
    if(record['Inmatriculat'] == null) { console.log("Inmatriculat null on id " + record['id']); return 'null'}
    return record['Inmatriculat'] == 'Da' ? 'true' : 'false';
};

var getCondition = (record) => {
    if(record['Stare'] == null) { console.log("Stare null on id " + record['id']); return 'null'}

    switch(record['Stare']){
        case 'Second hand': 
            return 'ConditionType.SecondHand';
        case 'Nou': 
            return 'ConditionType.New';
        default:
            console.log("Stare \"" + record['Stare'] + "\" not in range on id " + record['id']); 
            return 'null'
    }
};

var getSeller = (record) => {
    if(record['Oferit de'] == null) { console.log("Oferit de null on id " + record['id']); return 'null'}

    switch(record['Oferit de']){
        case 'Firma': 
            return 'SellerType.Company';
        case 'Proprietar': 
            return 'SellerType.Owner';
        default:
            console.log("Oferit de \"" + record['Oferit de'] + "\" not in range on id " + record['id']); 
            return 'null'
    }
};

var getVIN = (record) => {
    if(record['VIN'] == null) { console.log("VIN null on id " + record['id']); return 'null'}
    return "\"" + record['VIN'] + "\"";
};