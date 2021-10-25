//node gfg.js --url="https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=0&difficulty%5B%5D=1&difficulty%5B%5D=2&page=1&sortBy=submissions" 
let minimist = require("minimist");
let axios = require("axios");
let args = minimist(process.argv);
let jsdom = require("jsdom");
let excel = require("excel4node");
let fs = require("fs");
let path = require("path");
let puppeteer = require('puppeteer');

async function run(){
        let response = await axios.get(args.url);
        let html = response.data;
        let dom = new jsdom.JSDOM(html);
        let document = dom.window.document;
        let companies = [];
        let parent = document.getElementById('accordion');
        let children = parent.children[0];
        let company = children.querySelectorAll("div.checkbox");
        for(let i=0;i<company.length;i++)
        {
            let namec = company[i].querySelector("label > input[type='checkbox']");
            let nameOfCompany = company[i].querySelector("label > input[type='checkbox']").value;
            companies.push(
                {
                    name: nameOfCompany
                }
            );
        }

        for(let i=0;i<companies.length;i++)
        { 
            
            let browser = await puppeteer.launch({
                args:[
                    '--start-maximized' // full screen 
                 ],
                defaultViewport: null, // content in fullscreen 
                headless: false
            })
            let pages = await browser.pages();
            let page = pages[0];
            
            await page.goto("https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=2&page=1&sortBy=submissions&company%5B%5D=" + companies[i].name);

            await page.waitFor(2000);
            // let n = document.querySelector("div.itemsCount");
            // console.log(n);
            for(let k=0;k<10;k++)
            {
              await autoScroll(page);
            }
           
            //let qarray = await collectquestion(page);
            await page.waitFor(1000);
            await page.waitForSelector("div.panel-body > span");
            let hard = await page.$$eval("div.panel-body > span",function(atags){
                 let urls = [];
                 for(let i=0;i < atags.length;i++)
                 {
                    let url = atags[i].textContent;
                    urls.push(url);
                    
                 }
                 return urls;
            });

            await page.waitFor(1000);
            await page.waitForSelector("div.panel.problem-block > a");
            let h1 = await page.$$eval("div.panel.problem-block > a",function(atags){
                 let urls = [];
                 for(let i=0;i < atags.length;i++)
                 {
                    let url = atags[i].getAttribute("href");
                    urls.push(url);
                 }
                 return urls;
            });
            
            await page.goto("https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=1&page=1&sortBy=submissions&company%5B%5D=" + companies[i].name);

            for(let k=0;k<10;k++)
            {
              await autoScroll(page);
            }
            //let qarray = await collectquestion(page);
            await page.waitFor(1000);
            await page.waitForSelector("div.panel-body > span");
            let Medium = await page.$$eval("div.panel-body > span",function(atags){
                 let urls = [];
                 for(let i=0;i < atags.length;i++)
                 {
                    let url = atags[i].textContent;
                    urls.push(url);
                 }
                 return urls;
            });
            //console.log(Medium);
            await page.waitForSelector("div.panel.problem-block > a");
            let m1 = await page.$$eval("div.panel.problem-block > a",function(atags){
                 let urls = [];
                 for(let i=0;i < atags.length;i++)
                 {
                    let url = atags[i].getAttribute("href");
                    urls.push(url);
                 }
                 return urls;
            });
            await page.goto("https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=0&page=1&sortBy=submissions&company%5B%5D=" + companies[i].name);

            for(let k=0;k<10;k++)
            {
              await autoScroll(page);
            }
            //let qarray = await collectquestion(page);
            await page.waitFor(1000);
            await page.waitForSelector("div.panel-body > span");
            let Easy = await page.$$eval("div.panel-body > span",function(atags){
                 let urls = [];
                 for(let i=0;i < atags.length;i++)
                 {
                    let url = atags[i].textContent;
                    urls.push(url);
                 }
                 return urls;
            });
            //console.log(Easy);
            await page.waitForSelector("div.panel.problem-block > a");
            let e1 = await page.$$eval("div.panel.problem-block > a",function(atags){
                 let urls = [];
                 for(let i=0;i < atags.length;i++)
                 {
                    let url = atags[i].getAttribute("href");
                    urls.push(url);
                 }
                 return urls;
            });


            await putinexcelsheet(hard,h1,Medium,m1,Easy,e1,companies[i].name);
            //await page.click("a.clearFilters");
            await page.waitFor(2000);
            await browser.close();

        }
}
    

run();


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 50;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 1);
        });
    });
};


async function  putinexcelsheet(hard,h1,Medium,m1,Easy,e1,nameOfCompany) {
    let wb = new excel.Workbook();
    let level = ["Easy","Medium","Hard"];
    for(let j=0;j<level.length;j++)
    {
        let sheet = wb.addWorksheet(level[j]);
        if(j==0)
        {
        for (let i = 0; i < Easy.length; i++) {
            sheet.cell(2 + i, 1).string(Easy[i]);
            sheet.cell(2 + i, 5).link(e1[i]);
        }
        }
        else if(j==1)
        {
            for (let i = 0; i < Medium.length; i++) {
                sheet.cell(2 + i, 1).string(Medium[i]);
                sheet.cell(2 + i, 5).link(m1[i]);
            } 
        }
        else
        {
            for (let i = 0; i < hard.length; i++) {
                sheet.cell(2 + i, 1).string(hard[i]);
                sheet.cell(2 + i, 5).link(h1[i]);
            }  
        }
    }
    wb.write(nameOfCompany+".xlsx");
}
