const list = document.querySelector('.repo-list ul');
const userImages = document.querySelectorAll('.user-image');
const userNames = document.querySelectorAll('.username');
const fullName = document.querySelector('.full-name');
const followersCount = document.querySelector('.followers-count');
const followingCount = document.querySelector('.following-count');
const starsCount = document.querySelector('.stars-count');
const repoCount = document.querySelector('.repo-count');
const nameElement = document.querySelector('.user-details-name');
const stickyDetailBar = document.querySelector('.detail-stick-bar');
const navigation = document.querySelector('.openable-nav-item');
const toggleButton = document.querySelector('.nav-open-toggle');

async function fetchUserDetails(){
    try{
        let response = await graphqlQueryFetch(`
            query getRepositories($account: String! $count: Int!){
                user(login: $account){
                    name
                    avatarUrl
                    login
                    following {
                        totalCount
                    }
                    followers {
                        totalCount
                    }
                    starredRepositories {
                        totalCount
                    }
                    repositories(first: $count, orderBy: {direction: DESC, field: CREATED_AT}){
                        nodes {
                            name
                            updatedAt
                            isFork
                            isPrivate
                            description
                            stargazerCount
                            forkCount
                            licenseInfo {
                                name
                            }
                            primaryLanguage {
                                color
                                name
                            }
                        }
                    }
                }
            }
        `,{
            account: GITHUB_USERNAME,
            count: REPO_NO
        });
        if(response){
            const { 
                user: { 
                    avatarUrl,
                    name,
                    login,
                    following, 
                    followers, 
                    starredRepositories, 
                    repositories: { 
                        nodes
                    } 
                }
            } = response;
    
            const data = {
                repositories: nodes.map(node=>{
                    const { primaryLanguage,description, isPrivate, forkCount, isFork, licenseInfo, name, stargazerCount, updatedAt} = node;
                    return {
                        name,
                        language: primaryLanguage,
                        description,
                        isFork,
                        licenseInfo,
                        isPrivate,
                        forkCount,
                        stargazerCount,
                        updatedAt
                    }
                }),
                avatarUrl,
                name,
                username: login,
                following: following.totalCount,
                followers: followers.totalCount,
                starredRepositories: starredRepositories.totalCount
            }
            return data;
        }
    }catch(e){
        throw e
    }
}


function updateRepoList(repositories){
    repositories.forEach(repo=>{
        aC(list,new Repo(repo).getElem())
    })
}

async function main(){
    try{
        let data = await fetchUserDetails();
        if(data){
            let { repositories,name,following, username,followers,avatarUrl,starredRepositories } = data;
            updateRepoList(repositories);
            userImages.forEach(image=>{
                image.src = avatarUrl
            })
            userNames.forEach(name=>{
                setTextOnElement(name,username)
            })
            setTextOnElement(followingCount,fomartNumber(following))
            setTextOnElement(followersCount,fomartNumber(followers))
            setTextOnElement(starsCount,fomartNumber(starredRepositories))
            setTextOnElement(fullName,name)
            setTextOnElement(repoCount,fomartNumber(repositories.length))
            setPageVisibility(true)
        }
    }catch(e){
        console.error("ERROR",e)
    }

    //Observe Name Element
    const nameObserver = new IntersectionObserver(function(entries){
        entries.forEach(entry=>{
            if(!entry.isIntersecting){
                stickyDetailBar.style.opacity = 1
            }else{
                stickyDetailBar.style.opacity = 0
            }
        })
    },{
        rootMargin: '-67px 0px 0px 0px'
    })

    nameObserver.observe(nameElement);

    toggleButton.addEventListener('click',function(e){
        if(navigation.classList.contains('open')){
            navigation.classList.remove('open')
        }else{
            navigation.classList.add('open')
        }
    })
}


main();


