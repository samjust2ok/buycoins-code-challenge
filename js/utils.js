const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
});

function createElement(elem,className){
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

function setTextOnElement(elem,text){
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
function fomartNumber(number){
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
        this.repoElem = createElement('li','w-full border-b repo justify-between flex py-4');
        const language = repo.language;
        const dataContainer = createElement('div','flex-grow w-6-l lg-w-75');
        const star = createElement('div','w-6 lg-w-25');
        const repoName = createElement('div','mb-1 repo-name inline-block');
        const repoDesc = createElement('div','repo-desc');
        const repoMatrices = createElement('div','mt-2 flex flex-wrap gap-y-1 repo-metrices');
        const h3 = createElement('h3','font-bold');
        const a = createElement('a','break-all');
        const starButton = createElement('button','button repo-star btn-secondary button-shadow-small font-bold');
        const stbDiv = createElement('div','flex justify-end')
        setTextOnElement(a,repo.name);
        aC(repoName,h3)
        aC(h3,a)

        if(repo.description){
            const p = createElement('p','mb-2 pr-4 inline-block w-75');
            setTextOnElement(p,repo.description)
            aC(repoDesc,p)
        }

        if(language){
            const colorIndicator = createElement('span','mr-3');
            const color = createElement('span','language-color-indicator inline-block mr-1 relative rounded-full');
            color.style.backgroundColor = language.color;
            aC(colorIndicator,color,setTextOnElement(createElement('span','break-all'),language.name));
            aC(repoMatrices,colorIndicator)
        }

        if(repo.isPrivate){
            const label = createElement('span','repo-type-label ml-2 flex-shrink-0 font-semibold inline-block');
            aC(h3,setTextOnElement(label,'Private'))
        }
        
        if(repo.forkCount > 0){
            const forks = createElement('a','mr-3 cursor-pointer flex-shrink-0');
            aC(forks,createSVG(SVG.FORK));
            setTextOnElement(forks,` ${fomartNumber(repo.forkCount)}`)
            aC(repoMatrices,forks)
        }

        if(repo.licenseInfo?.name){
            const license = createElement('span','mr-3 flex-shrink-0 break-all');
            aC(repoMatrices,setTextOnElement(aC(license,createSVG(SVG.LICENSE)), ` ${repo.licenseInfo.name}`))
        }

        if(repo.stargazerCount > 0){
            const stars = createElement('a','mr-3 cursor-pointer flex-shrink-0');
            aC(repoMatrices,setTextOnElement(aC(stars,createSVG(SVG.STAR)),` ${fomartNumber(repo.stargazerCount)}`))
        }

        if(repo.updatedAt){
            const time = createElement('span');
            setTextOnElement(time,'Updated');
            aC(repoMatrices,aC(time,setTextOnElement(createElement('span','last-update-time'),` ${parseDate(repo.updatedAt)}`)))
        }

        aC(dataContainer,repoName,repoDesc,repoMatrices);
        aC(star,aC(stbDiv,setTextOnElement(aC(starButton,createSVG(SVG.STAR)),' Star')));
        aC(this.repoElem,dataContainer,star);
    }

    getElem(){
        return this.repoElem
    }
}

setPageVisibility(false)

