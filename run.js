const puppeteer = require('puppeteer');
const _ = require('lodash');
const fs = require('fs');

var offerParamsLabels = [
    'Oferit de',
    'Categorie',
    'Marca',
    'Model',
    'Versiune',
    'Anul fabricatiei',
    'Km',
    'Capacitate cilindrica',
    'Combustibil',
    'Putere',
    'Cutie de viteze',
    'Norma de poluare',
    'Caroserie',
    'Numar de portiere',
    'Culoare',
    'Vopsea metalizata',
    'Tara de origine',
    'Primul proprietar',
    'Fara accident in istoric',
    'Carte de service',
    'Stare'
];

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var getOfferLinks = async (page, link) => {
    await page.goto(link);

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

    return links;
}

var saveToFile = async (content) => {
    return fs.writeFile("D:/Master/Git/ProiectSADPuppeteer/download.json", content, function(err) {
        if(err) {
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


var getOfferParams = async (browser, link) => {
    const page = await browser.newPage();
    await page.goto(link, {
        timeout: 3000000
    });
    //await timeout(4000);

    //page.once('load'
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

    await page.close();

    return offerParamsModel;
}

var getInnerHtml = async (page, element) => {
    return await page.evaluate(
        el => el.innerHTML, element
    );
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var stringToFile = '';

    const noOfPages = 2;
    var galleryLinks = _.range(1, noOfPages + 1).map(index => 
        'https://www.autovit.ro/autoturisme/?search%5Bcountry%5D=&view=galleryWide&page=' + index
    );

    var offerLinksPromises = galleryLinks.map(link => getOfferLinks(page, link));
    var allLinks = await Promise.all(offerLinksPromises).then(linksNested => _.flatten(linksNested));
    
    var offerParamsPromises = [];
    for (index = 0; index < allLinks.length; index++) {
        var link = allLinks[index];
        console.log(link);
        offerParamsPromises.push(getOfferParams(browser, link));
    }

    await Promise.all(offerParamsPromises).then(values => {
        stringToFile = values;
    });
     

    await saveToFile(JSON.stringify(stringToFile));

    console.log();

    await browser.close();
})();