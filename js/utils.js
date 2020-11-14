const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
});

function cE(elem,className){
    const element = document.createElement(elem);
    element.setAttribute('class',className)
    return element
}


function aC(elem,...children){
    children.forEach(child=>{
        elem.appendChild(child)
    })
    return elem;
}

function sT(elem,text){
    aC(elem,document.createTextNode(text))
    return elem;
}

function createSVG(pathDirection){
    let namespace = 'http://www.w3.org/2000/svg';
    let svg = document.createElementNS(namespace,"svg");
    svg.setAttributeNS(null,'class','fill-current mr-1')
    let path = document.createElementNS(namespace,"path");
    path.setAttributeNS(null,'d',pathDirection);
    path.setAttribute('fill-rule','evenodd');
    svg.setAttribute('width',16);
    svg.setAttribute('height',16);
    svg.setAttribute('viewbox','0 0 16 16');
    aC(svg,path)
    return svg;
}

function getForkedLocationNameFromUrl(url){
    let split = url.split('/');
    let l = split.length;
    return `${split[l-3] ?? ''}/${split[l-2]?? ''}`
}

// Simple function to format number
function fN(number){
    return new Intl.NumberFormat(
        'en-IN',
        {
            maximumSignificantDigits: 3,
        }
    ).format(number)
}

//Small utility to parse date
function parseDate(date){
    const dateObject = new Date(date)
    const dateHours = dateObject.getHours();
    const dateMinutes = dateObject.getMinutes();
    const dateInMonth = dateObject.getDate();
    const dateYear = dateObject.getFullYear();
    const month = dateObject.getMonth();

    const nowObject = new Date();
    const nowMinutes = nowObject.getMinutes();
    const nowHours = nowObject.getHours();
    const nowInMonth = nowObject.getDate();
    const nowYear = nowObject.getFullYear();

    if(nowObject.getMonth() > month || nowYear > dateYear){
        return `on ${dateInMonth} ${MONTHS[month]} ${nowYear > dateYear ? dateYear : ''}`
    }

    
    if(month === nowObject.getMonth()){
        const diff = nowInMonth - dateInMonth;
        if(diff > 0){
            if(diff === 1){
                return 'yesterday'
            }else{
                return `${diff} days ago`
            }
        }
    }

    if(nowHours === dateHours){
        let diff = nowMinutes - dateMinutes;
        if(diff === 0){
            return 'some seconds ago'
        }

        return `${ diff === 1 ? 'a' : diff } minute${diff === 1 ? '':'s'} ago`
    }else{
        let diff = nowHours - dateHours;
        return `${ diff === 1 ? 'an' : diff } hour${diff === 1 ? '':'s'} ago`
    }

}

async function graphqlQueryFetch(query,variables){
    let response = await fetch(API_ENDPOINT,{
        method: 'POST',
        headers,
        body: JSON.stringify({
            query,
            variables,
        })
    })
    let parsed = await response.json()
    return parsed.data;
}

function setPageVisibility(visible){
    document.querySelector('main').style.visibility = visible ? 'visible'  : 'hidden'
    document.querySelector('footer').style.visibility = visible ? 'visible'  : 'hidden'
}

class Repo {
    repoElem;
    constructor(repo){
        this.repoElem = cE('li','w-full border-b repo justify-between flex py-4');
        const language = repo.language;
        const dataContainer = cE('div','flex-grow w-6-l lg-w-75');
        const star = cE('div','w-6 lg-w-25');
        const repoName = cE('div','mb-1 repo-name inline-block');
        const repoDesc = cE('div','repo-desc');
        const repoMatrices = cE('div','mt-2 flex flex-wrap gap-y-1 repo-metrices');
        const h3 = cE('h3','font-bold');
        const a = cE('a','break-all');
        const starButton = cE('button','button repo-star btn-secondary button-shadow-small font-bold');
        const stbDiv = cE('div','flex justify-end')
        sT(a,repo.name);
        aC(repoName,h3)
        aC(h3,a)

        if(repo.description){
            const p = cE('p','mb-2 pr-4 inline-block w-75');
            sT(p,repo.description)
            aC(repoDesc,p)
        }

        if(language){
            const colorIndicator = cE('span','mr-3');
            const color = cE('span','language-color-indicator inline-block mr-1 relative rounded-full');
            color.style.backgroundColor = language.color;
            aC(colorIndicator,color,sT(cE('span','break-all'),language.name));
            aC(repoMatrices,colorIndicator)
        }

        if(repo.isPrivate){
            const label = cE('span','repo-type-label ml-2 flex-shrink-0 font-semibold inline-block');
            aC(h3,sT(label,'Private'))
        }

        // if(repo.isFork){
        //     const span = cE('span','forked-from mb-1');
        //     const a = cE('a')
        //     sT(span,'Forked from ');
        //     sT(a,getForkedLocationNameFromUrl(repo.forks_url))
        //     aC(repoName,aC(span,a))
        // }

        if(repo.forkCount > 0){
            const forks = cE('a','mr-3 cursor-pointer flex-shrink-0');
            aC(forks,createSVG(SVG.FORK));
            sT(forks,` ${fN(repo.forkCount)}`)
            aC(repoMatrices,forks)
        }

        if(repo.licenseInfo?.name){
            const license = cE('span','mr-3 flex-shrink-0 break-all');
            aC(repoMatrices,sT(aC(license,createSVG(SVG.LICENSE)), ` ${repo.licenseInfo.name}`))
        }

        if(repo.stargazerCount > 0){
            const stars = cE('a','mr-3 cursor-pointer flex-shrink-0');
            aC(repoMatrices,sT(aC(stars,createSVG(SVG.STAR)),` ${fN(repo.stargazerCount)}`))
        }

        if(repo.updatedAt){
            const time = cE('span');
            sT(time,'Updated');
            aC(repoMatrices,aC(time,sT(cE('span','last-update-time'),` ${parseDate(repo.updatedAt)}`)))
        }

        aC(dataContainer,repoName,repoDesc,repoMatrices);
        aC(star,aC(stbDiv,sT(aC(starButton,createSVG(SVG.STAR)),' Star')));
        aC(this.repoElem,dataContainer,star);
    }

    getElem(){
        return this.repoElem
    }
}

