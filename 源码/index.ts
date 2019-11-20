const container = document.querySelector('.container') as HTMLElement
const startButton = document.querySelector('.start') as HTMLButtonElement
const catButton = document.querySelector('.cat') as HTMLButtonElement
const fishButton = document.querySelector('.fish') as HTMLButtonElement
const wallButton = document.querySelector('.wall') as HTMLButtonElement
const p = document.createElement("p") as HTMLElement
let map: Array<Array<pNode>>
let parmentList: Array<pNode>
let closedList: Array<pNode>
let openList: Array<pNode>
let row: number = 40
let coluem: number = 40
interface coordinate {
    [key: string]: number,
}
interface stop {
    [key: string]: {
        X: number,
        Y: number,
        H: number,
        G: number,
        F: number,
        parment: pNode,
        role: string
    }
}
interface pNode extends HTMLElement {
    info: {
        X: number,
        Y: number,
        H: number,
        G: number,
        F: number,
        parment: pNode,
        role: string
    }
}

interface verify {
    (start: pNode, end: pNode, parmentNode?: pNode): pNode | stop
}

const cat: coordinate = {
    X: 3,
    Y: 5
}
const fish: coordinate = {
    X: 3,
    Y: 9
}
const stopSearch: stop = {
    info: {
        X: 0, Y: 0, H: 0, G: Infinity,
        F: Infinity,
        parment: null,
        role: ''
    }
}

const init = (row: number = 40, column: number = 40): void => {
    closedList = []
    openList = []
    parmentList = []
    p.className = "element"
    let childs = container.childNodes
    for (let i = childs.length - 1; i >= 0; i--) {
        container.removeChild(childs[i])
    }
    map = new Array(row)
    for (let i = 0; i < row; ++i) {
        map[i] = new Array()
        for (let j = 0; j < column; ++j) {
            let element = <pNode>p.cloneNode(true)
            element.info = {
                X: i, Y: j, H: 0, G: 0,
                F: Infinity,
                parment: null,
                role: ''
            }
            // element.innerHTML = `
            // X:${element.info.X} Y:${element.info.Y}<br>
            // F:${element.info.F}<br>
            // G:${element.info.G}<br>
            // H:${element.info.H}<br>
            // `
            map[i][j] = element
            container.append(map[i][j])
        }
    }
}
init(row, coluem)
//  计算出H 和F值
const computerPath: verify = (cat, fish) => {
    //曼哈顿计算
    cat.info.H = (Math.abs(cat.info.X - fish.info.X) + Math.abs(cat.info.Y - fish.info.Y))
    cat.info.F = cat.info.H + cat.info.G
    // cat.innerHTML = `
    // X:${cat.info.X} Y:${cat.info.Y}<br>
    // F:${cat.info.F}<br>
    // G:${cat.info.G}<br>
    // H:${cat.info.H}<br>
    // `
    return cat
}
const setRole = (cat: pNode, fish: pNode) => {
    cat.info.role = 'cat'
    cat.info.F = 99999
    cat.style.background = 'black'
    fish.info.role = 'fish'
    fish.style.background = '#FDCC59'
}


const clearRole = (cat: pNode, fish: pNode) => {
    cat.info.role = ''
    cat.info.F = Infinity
    cat.style.background = ''
    fish.info.role = ''
    fish.style.background = ''

}

const Pathfinding: verify = (start, end, parmentNode: pNode) => {
    //如果不在就加入oplinst
    if (closedList.indexOf(start) == -1 && openList.indexOf(start) == -1) {
        start.style.background = '#3EBB5A'
        start.info.parment = parmentNode // 设为父节点
        start.info.G = (parmentNode.info.G + 1)  //获取G值
        openList.push(start) //加入列表
        return computerPath(start, end)
    }
    if (openList.indexOf(start) != -1) {
        if ((parmentNode.info.G + 1) < start.info.G) {
            // parmentNode.info.parment = start 有问题的
            return computerPath(parmentNode, end)
        }
    }
    return undefined
}

const up: verify = (cat, fish) => {
    let { X, Y } = cat.info
    let parmentNode = map[X][Y]
    if (Y == 0) return stopSearch
    if (closedList.indexOf(map[X][--Y]) != -1) return stopSearch
    return Pathfinding(map[X][Y], fish, parmentNode)
}
const down: verify = (cat, fish) => {
    let { X, Y } = cat.info
    let parmentNode = map[X][Y]
    if (Y == (coluem - 1)) return stopSearch
    if (closedList.indexOf(map[X][++Y]) != -1) return stopSearch
    return Pathfinding(map[X][Y], fish, parmentNode)
}
const left: verify = (cat, fish) => {
    let { X, Y } = cat.info
    let parmentNode = map[X][Y]
    if (X == 0) return stopSearch
    if (closedList.indexOf(map[--X][Y]) != -1) return stopSearch
    return Pathfinding(map[X][Y], fish, parmentNode)

}

const right: verify = (cat, fish) => {
    let { X, Y } = cat.info
    let parmentNode = map[X][Y]
    if (X == (row - 1)) return stopSearch
    if (closedList.indexOf(map[++X][Y]) != -1) return stopSearch
    return Pathfinding(map[X][Y], fish, parmentNode)
}

const search: verify = (cat, fish) => { //判断返回的最小值数组
    [up(cat, fish), left(cat, fish), down(cat, fish), right(cat, fish)]
    //取出最小F
    let F: Number = Math.min.apply(null, openList.map(item => item.info.F))
    let Farr: Array<pNode> = openList.reverse().filter(item => {
        if (item.info.F <= F) {
            return item
        }
        return undefined
    })
    //取出最小H
    let H: Number = Math.min.apply(null, Farr.map(item => item.info.H))
    return Farr.find(item => {
        if (item.info.H <= H) {
            return item
        }
        return undefined
    })
}

const mian = () => {
    openList.push(map[cat.X][cat.Y]) //启动
    while (openList.length > 0 && map[cat.X][cat.Y].info.role != 'fish') {
        closedList.push(map[cat.X][cat.Y])
        openList.splice(openList.indexOf(map[cat.X][cat.Y]), 1) //重open列表移除
        let next = search(map[cat.X][cat.Y], map[fish.X][fish.Y])
        cat.X = next.info.X
        cat.Y = next.info.Y
        parmentList.push(next.info.parment) // 尝试的所有路径
    }
}
catButton.onclick = () => {
    container.onclick = (event: MouseEvent) => {
        let target = (<pNode>event.target)
        if (target.nodeName == 'P') {
            init(row, coluem)
            clearRole(map[cat.X][cat.Y], map[fish.X][fish.Y])
            cat.X = target.info.X
            cat.Y = target.info.Y
            setRole(map[cat.X][cat.Y], map[fish.X][fish.Y])
        }

    }
}

fishButton.onclick = () => {
    container.onclick = (event: MouseEvent) => {
        let target = (<pNode>event.target)
        if (target.nodeName == 'P') {
            init(row, coluem)
            clearRole(map[cat.X][cat.Y], map[fish.X][fish.Y])
            fish.X = target.info.X
            fish.Y = target.info.Y
            setRole(map[cat.X][cat.Y], map[fish.X][fish.Y])
        }

    }

}

wallButton.onclick = () => {
    container.onclick = (event: MouseEvent) => {
        let target = (<pNode>event.target)
        if (target.nodeName == 'P') {
            target.info = stopSearch.info
            closedList.push(target)
            target.style.background = "blue"
        }

    }

}

setRole(map[cat.X][cat.Y], map[fish.X][fish.Y])
startButton.onclick = () => {
    mian()
    let next: pNode = map[fish.X][fish.Y].info.parment
    let first =  parmentList.shift()
    while (next) {
        next.style.background = 'red'
        next = next.info.parment
    }
    cat.X = first.info.X
    cat.Y = first.info.Y
    setRole(first,map[fish.X][fish.Y])
  
}

