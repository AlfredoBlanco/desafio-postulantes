const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

const url = 'https://www.sii.cl/servicios_online/1047-nomina_inst_financieras-1714.html';

const getTableData = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const [info, fields] = await page.evaluate(() => {
        const table = document.querySelectorAll('#tabledatasii tbody tr');
        const field = document.querySelector('#tabledatasii thead tr');
        const fieldName = field.innerText.split('\t');
        let tableData = [];
        for(let e of table){
            e.innerText ? tableData.push(e.innerText.split('\t')) : '';
        }
        
        return [tableData, fieldName] ;
    });
    
    const allData = info.map( e => (
        {
        [fields[0]] : e[0],
        [fields[1]] : e[1],
        [fields[2]] : e[2],
        [fields[3]] : e[3],
        [fields[4]] : e[4],
        [fields[5]] : e[5],
        [fields[6]] : e[6],
        }
    ));
    
    await browser.close();
    return allData;
};

//The function getTableData brings all the json from the page
//You can also filter with using id query 
app.get('/', async (req, res) => {
    try{

        const {id} = req.query;
        let api = await getTableData();

        if (id) api = api.find(e => Number(e['No.']) === Number(id));
        
        if (!api) res.status(400).json({error: 'No id matches'}); 
        
        res.status(200).json(api);
    }
    catch(err){
        res.status(404).send(err);
    }
});

app.listen(3000, () => console.log('Server listening on port 3000...'));