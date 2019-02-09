const puppeteer = require('puppeteer');
const _ = require('lodash');
const fs = require('fs');
const insertScripts = require('./insertScripts.js');

// var offerParamsLabels = [
//     'Oferit de',
//     'Categorie',
//     'Marca',
//     'Model',
//     'Versiune',
//     'Anul fabricatiei',
//     'Km',
//     'Capacitate cilindrica',
//     'Combustibil',
//     'Putere',
//     'Cutie de viteze',
//     'Norma de poluare',
//     'Caroserie',
//     'Numar de portiere',
//     'Culoare',
//     'Vopsea metalizata',
//     'Tara de origine',
//     'Primul proprietar',
//     'Fara accident in istoric',
//     'Carte de service',
//     'Stare'
// ];

var progress = 0;
var totalRequestsCount = 0;

var globalFeatures = ["ABS",
"Computer de bord",
"Inchidere centralizata",
"Acoperis panoramic",
"Airbag genunchi sofer",
"Bare longitudinale acoperis",
"Faruri automate",
"Jante din aliaj usor",
"Navigatie GPS",
"Oglinzi retrovizoare exterioare electrocromatice",
"Pilot automat",
"Senzori parcare fata-spate",
"Trapa",
"Airbag-uri frontale",
"Controlul stabilitatii (ESP)",
"Radio",
"Aer conditionat",
"Airbag-uri cortina",
"Controlul tractiunii (ASR)",
"Faruri Xenon",
"Limitator de viteza",
"Oglinda retrovizoare interioara electrocromatica",
"Oglinzi retrovizoare incalzite",
"Proiectoare ceata",
"Senzori parcare spate",
"Airbag-uri laterale fata",
"Geamuri fata electrice",
"Servodirectie",
"Aer conditionat doua zone",
"Airbag-uri laterale spate",
"DVD",
"Head-up display",
"Lumini de zi (LED)",
"Oglinzi retrovizoare ajustabile electric",
"Parbriz incalzit",
"Scaune fata incalzite",
"Stergatoare parbriz automate",
"Carlig remorca",
"Incalzire auxiliara",
"Bluetooth",
"Comenzi volan",
"CD",
"Camera parcare spate",
"Geamuri laterale spate fumurii",
"Alarma",
"Geamuri cu tenta",
"Imobilizator electronic",
"Interior din velur",
"Geamuri spate electrice",
"Intrare auxiliara",
"Suspensie reglabila",
"Aer conditionat patru zone",
"Scaune spate incalzite",
"Interior din piele",
"TV"];

var getOfferLinks = async (browser, link) => {
    const page = await browser.newPage();
    await page.goto(link, {
        timeout: 3000000
    });

    const offers = await page.$$('#gallerywide article a.offer-title__link');

    const hrefAttributeValuePromises = await offers.map(offer => {
        const hrefAttributeValuePromise = page.evaluate(
            link => link.getAttribute('href'), offer
        );
        return hrefAttributeValuePromise;
    });

    var links = [];
    await Promise.all(hrefAttributeValuePromises).then(values => {
        links = values;
    });

    await page.close();

    console.log('Got links from gallery page.')
    return links;
}

var saveToFile = async (content) => {
    return fs.writeFile("C:/Work/Master/ProiectSADPuppeteer/download.json", content, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("The file was saved!");
    });
}

var getOfferParamByElement = async (page, element) => {
    var paramLabel = await element.$('.offer-params__label');
    var paramValueLink = await element.$('.offer-params__value .offer-params__link');
    var paramValue = await element.$('.offer-params__value');

    var paramLabelValue = await getInnerHtml(page, paramLabel);
    var paramValueLinkValue = paramValueLink == null ? null : await getInnerHtml(page, paramValueLink);
    var paramValueValue = paramValueLinkValue != null ? paramValueLinkValue : await getInnerHtml(page, paramValue);

    var result = {};
    result[paramLabelValue] = paramValueValue.trim();

    return result;
}

var getFeatureByElement = async (page, element) => {
    return await getInnerText(page, element)
}


var getOfferDetails = async (browser, link) => {
    // open the offer page
    const page = await browser.newPage();
    await page.goto(link, {
        timeout: 3000000
    });

    // params
    var offerParamsModel = {};
    var offerParamsPromises = [];
    const offerParams = await page.$$('li.offer-params__item');

    for (index = 0; index < offerParams.length; index++) {
        var param = offerParams[index];
        var offerParamPromise = getOfferParamByElement(page, param);
        offerParamsPromises.push(offerParamPromise);
    }

    await Promise.all(offerParamsPromises).then(offerParamsList => {
        offerParamsModel = _.assign(offerParamsModel, ...offerParamsList)
    });


    // price
    const offerPriceElement = await page.$('.offer-price');
    const offerPriceString = await page.evaluate(
        el => el.getAttribute('data-price'), offerPriceElement
    );
    const offerPrice = parseInt(offerPriceString.replace(/\s+/g, ''));
    offerParamsModel.price = offerPrice;

    // features
    const offerFeaturesElements = await page.$$('.offer-features__list>li.offer-features__item');
    const offerFeaturesPromises = offerFeaturesElements.map(featureElement => getFeatureByElement(page, featureElement));

    await Promise.all(offerFeaturesPromises).then(features => {
        offerParamsModel.features = features;
    });


    await page.close();

    progress++;
    console.log('Progress: ' + Math.floor((progress / totalRequestsCount) * 100) + '%');

    return offerParamsModel;
}

var getInnerHtml = async (page, element) => {
    return await page.evaluate(
        el => el.innerHTML, element
    );
}

var getInnerText = async (page, element) => {
    return await page.evaluate(
        el => el.innerText, element
    );
}

var firstofferId = 961;

var getOfferWithIds = (offer, index) => {
    offer.id = index + firstofferId;

    featuresIds = offer.features.map(feature => {
        featureIndex = globalFeatures.indexOf(feature);
        if (featureIndex < 0) {
            console.log('Feature ' + feature + ' NOT FOUND ------------------');
        }

        //id
        return featureIndex + 1;
    });

    offer.featuresIds = featuresIds;

    return offer;
}

var getOfferWithParsedFields = (offer) => {
    if (offer['Anul fabricatiei'] != null)
        offer['Anul fabricatiei'] = parseInt(offer['Anul fabricatiei']);

    if (offer['Km'] != null)
        offer['Km'] = parseInt(offer['Km'].replace(/[^0-9]/g, ''));

    if (offer['Capacitate cilindrica'] != null)
        offer['Capacitate cilindrica'] = parseInt(offer['Capacitate cilindrica'].replace(/\s+/g, ''));

    if (offer['Putere'] != null)
        offer['Putere'] = parseInt(offer['Putere'].replace(/[^0-9]/g, ''));

    if (offer['Numar de portiere'] != null)
        offer['Numar de portiere'] = parseInt(offer['Numar de portiere']);

    return offer;
}

(async () => {
    // open browser
    const browser = await puppeteer.launch();

    // number of offers pages (gallery pages)
    const noOfPages = 50;

    // links of the gallery pages
    var galleryLinks = _.range(33, noOfPages + 33).map(index =>
        'https://www.autovit.ro/autoturisme/?search%5Border%5D=created_at_first%3Adesc&search%5Bcountry%5D=&view=galleryWide&page=' + index
    );

    // links of all the offers
    var offerLinksPromises = galleryLinks.map(link => getOfferLinks(browser, link));
    var allOffersLinks = await Promise.all(offerLinksPromises).then(linksNested => _.flatten(linksNested));
    totalRequestsCount = allOffersLinks.length;

    // get details for every offer
    // var offersDetailsPromises = allOffersLinks.map(offerLink => getOfferDetails(browser, offerLink));
    var offersDetails = [];



    maxParallelRequests = 12;
    for (let i = 0; i < allOffersLinks.length; i += maxParallelRequests) {
        var lastIndexOfSlice = Math.min((i + maxParallelRequests), allOffersLinks.length)
        await Promise.all(allOffersLinks
            .slice(i, lastIndexOfSlice)
            .map(offerLink => getOfferDetails(browser, offerLink))).then(values => {
                offersDetails = offersDetails.concat(values);
            });
    }

    offersDetails = offersDetails.map(getOfferWithIds);
    offersDetails = offersDetails.map(getOfferWithParsedFields);

    var featuresInsertScripts = insertScripts.getFeatures(globalFeatures);
    var recordsInserScripts = insertScripts.getRecords(offersDetails);
    var recordsfeaturesInsertScripts = insertScripts.getRecordsFeatures(offersDetails);

    await saveToFile(JSON.stringify(offersDetails) + '\n\n\n' + featuresInsertScripts + '\n\n\n' + recordsInserScripts + '\n\n\n' + recordsfeaturesInsertScripts);

    await browser.close();
})();