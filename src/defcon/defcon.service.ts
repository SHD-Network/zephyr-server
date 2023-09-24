import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NestCrawlerService } from 'nest-crawler';
import { PrismaService } from '@zephyr/prisma/prisma.service';

type DefconData = {
  level: string;
  lastChange?: string;
  news: any;
};

type Region =
  | 'overall'
  | 'africa'
  | 'mideast'
  | 'cyber'
  | 'europe'
  | 'asia'
  | 'usa'
  | 'latam'
  | 'space'
  | 'specops';

const months = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

const url = {
  overall: 'https://www.defconlevel.com/current-level.php',
  africa: 'https://www.defconlevel.com/africa-command-news.php',
  mideast: 'https://www.defconlevel.com/central-command-news.php',
  cyber: 'https://www.defconlevel.com/cyber-command-news.php',
  europe: 'https://www.defconlevel.com/european-command-news.php',
  asia: 'https://www.defconlevel.com/indo-pacific-command-news.php',
  usa: 'https://www.defconlevel.com/northern-command-news.php',
  latam: 'https://www.defconlevel.com/southern-command-news.php',
  space: 'https://www.defconlevel.com/space-command-news.php',
  specops: 'https://www.defconlevel.com/special-operations-command-news.php',
};

@Injectable()
export class DefconService {
  constructor(
    private readonly crawler: NestCrawlerService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateAll() {
    await this.update('overall', url.overall);
    await this.update('africa', url.africa);
    await this.update('mideast', url.mideast);
    await this.update('cyber', url.cyber);
    await this.update('europe', url.europe);
    await this.update('asia', url.asia);
    await this.update('usa', url.usa);
    await this.update('latam', url.latam);
    await this.update('space', url.space);
    await this.update('specops', url.specops);
  }

  async update(regionName: Region, regionUrl: string) {
    const overallData = await this.fetch(regionUrl);

    const region = await this.prisma.defconLevels.upsert({
      where: {
        region: regionName,
      },
      update: {
        level: overallData.level,
      },
      create: {
        region: regionName,
        level: overallData.level,
      },
    });

    const insertData = [];

    for (let i = 0; i < overallData.updates.length; i++) {
      if (overallData.updates[i].text === undefined) {
        continue;
      }

      insertData.push({
        regionId: region.id,
        date: overallData.updates[i].date,
        value: overallData.updates[i].text,
      });
    }

    await this.prisma.defconUpdates.createMany({
      data: insertData,
      skipDuplicates: true,
    });
  }

  async get(region: Region) {
    const data = await this.prisma.defconLevels.findUnique({
      where: {
        region,
      },
      select: {
        level: true,
        DefconUpdates: {
          select: {
            date: true,
            value: true,
          },
        },
      },
    });

    return data;
  }

  async fetch(url: string, lastUpdate = false) {
    const data: DefconData = await this.crawler.fetch({
      target: url,
      fetch: lastUpdate
        ? {
            level: {
              selector: '#wrapper #content .main-box.main-box-text img',
              attr: 'alt',
            },
            lastChange: {
              selector:
                '#wrapper #content .main-box.main-box-text .center.bold.two-percent-top i div',
            },
            news: {
              selector: 'p:contains("Read more")',
            },
          }
        : {
            level: {
              selector: '#wrapper #content .main-box.main-box-text img',
              attr: 'alt',
            },
            news: {
              selector: 'p:contains("Read more")',
            },
          },
    });

    let level = 0;

    if (data.level.includes('1')) {
      level = 1;
    }

    if (data.level.includes('2')) {
      level = 2;
    }

    if (data.level.includes('3')) {
      level = 3;
    }

    if (data.level.includes('4')) {
      level = 4;
    }

    if (data.level.includes('5')) {
      level = 5;
    }

    const news = data.news.split('Read more');
    const updates: {
      date: Date;
      text: string;
    }[] = [];

    for (let i = 0; i < news.length; i++) {
      const article = news[i];

      if (article === '') {
        continue;
      }

      const articleElements = article.split(' -  ');

      let dateString = articleElements[0];

      dateString = dateString.replace('Last Change: ', '');
      dateString = dateString.replace(',', '');

      const dateElements = dateString.split(' ');

      const articleDate = new Date();
      articleDate.setUTCFullYear(parseInt(dateElements[2]));
      articleDate.setUTCDate(parseInt(dateElements[1]));

      articleDate.setUTCMonth(months[dateElements[0]]);

      articleDate.setUTCHours(0);
      articleDate.setUTCMinutes(0);
      articleDate.setUTCSeconds(0);
      articleDate.setUTCSeconds(0);
      articleDate.setUTCMilliseconds(0);

      updates.push({
        date: articleDate,
        text: articleElements[1],
      });
    }

    if (data.lastChange) {
      let changeString = data.lastChange;

      changeString = changeString.replace('Last Change: ', '');
      changeString = changeString.replace(',', '');
      changeString = changeString.replace('st', '');
      changeString = changeString.replace('nd', '');
      changeString = changeString.replace('rd', '');
      changeString = changeString.replace('th', '');

      const changeElements = changeString.split(' ');

      const changeDate = new Date();
      changeDate.setUTCFullYear(parseInt(changeElements[2]));
      changeDate.setUTCDate(parseInt(changeElements[1]));

      changeDate.setUTCMonth(months[changeElements[0]]);

      changeDate.setUTCHours(0);
      changeDate.setUTCMinutes(0);
      changeDate.setUTCSeconds(0);
      changeDate.setUTCSeconds(0);
      changeDate.setUTCMilliseconds(0);

      return {
        level,
        changeDate,
        updates,
      };
    }

    return {
      level,
      updates,
    };
  }
}
