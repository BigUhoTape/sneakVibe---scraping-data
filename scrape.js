const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');

const URL = 'https://street-beat.ru/cat/man/krossovki/?page=2';

const linksOnPage = [];

request(URL,  async(error, response, html) => {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);


        await $('.catalog-item__title').each(async(i, el) => {
            const link = await $(el).attr('href');
            const itemLink = 'https://street-beat.ru'+link;
            linksOnPage.push(itemLink);
        });

        linksOnPage.forEach((item, i, linksOnPage) => {
            request(item, async (err, response, html) => {
                if (!error && response.statusCode == 200) {
                    const $ = await cheerio.load(html);
                    const productImage = [];
                    const gender = 'male';
                    let reg = /мужские\sкроссовки/i;

                    const name = await $('.product-heading span').text().replace(reg, '').trim();
                    const article = await $('.product-article').html().replace('<span>&#x410;&#x440;&#x442;.</span>', '').trim();
                    const color = await $('.product-info__text.product-info__text-color').first().text().trim();
                    const price = await $('.price--current').first().text();
                    // let image = 'https://street-beat.ru' + await $('.product-thumb__slide-image').attr('src');

                    await $('.slider-product-main__slide-image').each(async (i, el) => {
                        const image = 'https://street-beat.ru' +  await $(el).attr('src');
                        productImage.push(image);
                    });
                    const description = await $('.tab__row--lg-margin.tab__row--lg-margin_min.tab-inside__content-manager').text().trim();


                    axios({
                        url: 'http://localhost:8081/api/product',
                        method: 'post',
                        data: {
                            model: name,
                            article: article,
                            price: price,
                            gender: gender,
                            images: productImage,
                            color: color,
                            discountPrice: '',
                            description: description
                        }
                    }).then(res => console.log(res)).catch(e => console.log(e));
                }
            });
        });
    }
});
