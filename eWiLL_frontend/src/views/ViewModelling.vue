<template>

    <!-- <div>
        {{entityList}}
    </div> -->

    <!-- <div>
        {{ankerPoints}}
    </div> -->

    <!-- <div>
        {{lineList}}
    </div> -->

    <!-- <div>
        {{lineList}}
    </div> -->

    <div class="toolbox">
        <IconEntity id="item" draggable="true" @click="addElement($event, EntityTyp.ENTITY)"/>
        <IconRelationshiptyp @mousedown="addElement($event, EntityTyp.RELATIONSHIP)"/>
        <IconEntityRelationshiptyp @mousedown="addElement($event, EntityTyp.ENTITYRELATIONSHIP)"/>
    </div>

    <div class="modellingContainer">
        <Entity v-for="entity in entityList" :key="entity.id" :entity="entity" @ankerPoint="handleAnkerPoint" @deleteEntity="deleteEntity"/>

        <Line v-for="line in lineList" :key="line.id" :line="line" @deleteLine="deleteLine" @changeLine="changeLineStyle"/>
        
        <!-- Definiert global das aussehen der Pfeile (TODO: In Component auslagern) -->
        <svg class="svgMarker">
            <defs>
                <marker id="arrowhead" markerWidth="20" markerHeight="10" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 0 4, 6 2" />
                </marker>

                <filter id="double">
                    <feMorphology in="SourceGraphic" result="a" operator="dilate" radius="1.2" />
                    <feComposite in="SourceGraphic" in2="a" result="xx" operator="xor" />
                </filter>
            </defs>
        </svg>

        

    </div>
    
</template>

<script setup>
    import Entity from "../components/Entity.vue"
    import Line from "../components/Line.vue"

    import IconEntityRelationshiptyp from "../components/icons/IconEntityRelationshiptyp.vue"
    import IconEntity from "../components/icons/IconEntitytyp.vue"
    import IconRelationshiptyp from "../components/icons/IconRelationshiptyp.vue"
    import IconKante from "../components/icons/IconKante01.vue"

    import EntityTyp from "../enums/EntityTyp"

    import { onMounted, ref, watch } from 'vue'

    const count = ref(0)

    const entityList = ref([
        { "id": 1, "typ": 1, "top": "124px", "left": "81px", "width": "100px", "text": "Kunde" },
        { "id": 2, "typ": 3, "text": "Rechnung", "top": "122px", "left": "302px", "width": "100px" },
        { "id": 3, "typ": 1, "text": "Artikel", "top": "207px", "left": "81px", "width": "100px" },
        { "id": 4, "typ": 2, "text": "Rechnungs\npositionen", "top": "118px", "left": "486px", "width": "100px" }
    ])
    
    const lineList = ref([
        //{ "id": 1, "x1": 200, "y1": 100, "x2": 0, "y2": 0},
        //{ "id": 2, "x1": 200, "y1": 100, "x2": 0, "y2": 200},
        // { "id": 3}
    ])

    const newAnkerPoint = ref({})
    const ankerPoints = ref([
        { "startEntity": 1, "startEntityPosition": "right", "endEntity": 2, "endEntityPosition": "left", "style": 0  },
        { "startEntity": 3, "startEntityPosition": "right", "endEntity": 2, "endEntityPosition": "left", "style": 1  },
        { "startEntity": 2, "startEntityPosition": "right", "endEntity": 4, "endEntityPosition": "left", "style": 2  }
    ])

    onMounted(() => {
        updateLines()
    })

    watch(entityList.value, () => {
        console.log("watcher: entityList")
        updateLines()
    },
    {deep: true}
    )

    watch(ankerPoints.value, () => {
        console.log("watcher: ankerPoints")
        updateLines()
    },
    {deep: true}
    )

    const updateLines = () => {
        let calculatedLines = []

        console.log('Update Lines')
        //console.log(ankerPoints)
        
        for (const [index, anker] of ankerPoints.value.entries()) {

            let calculatedLine = calculateLine(anker)
            calculatedLine.id = index
            
            calculatedLines.push(calculatedLine)
        }

        lineList.value = calculatedLines
    }

    const calculateLine = (anker) => {
        let line = {}

        let startEntity = entityList._rawValue.find(x => x.id == anker.startEntity)
        let startEntityWidth = parseInt(startEntity.width)
        let startPositionFactor = getPositionFactor(anker.startEntityPosition, startEntityWidth)

        line.y1 = parseInt(startEntity.top) + startPositionFactor.y
        line.x1 = parseInt(startEntity.left) + startPositionFactor.x


        let endEntity = entityList._rawValue.find(x => x.id == anker.endEntity)
        let endEntityWidth = parseInt(endEntity.width)
        let endPositionFactor = getPositionFactor(anker.endEntityPosition, endEntityWidth)
        line.y2 = parseInt(endEntity.top) + endPositionFactor.y
        line.x2 = parseInt(endEntity.left) + endPositionFactor.x

        line.style = anker.style

        return line
    }

    const getPositionFactor = (position, entityWidth) => {
        let positionFactor = {}

        switch (position) {
            case 'top':
                positionFactor.y = 0
                positionFactor.x = entityWidth / 2
                break;
            case 'right':
                positionFactor.y = entityWidth / 4
                positionFactor.x = entityWidth
                break;
            case 'bottom':
                positionFactor.y = entityWidth / 2
                positionFactor.x = entityWidth / 2
                break;
            case 'left':
                positionFactor.y = entityWidth / 4
                positionFactor.x = 0
                break;
            default:
                throw "Unhandled position from anker.";
        }

        return positionFactor
    }

    const deleteEntity = (entityToDelete) => {

        // delete Entity
        let entityIndex = entityList.value.indexOf(entityToDelete)
        entityList.value.splice(entityIndex, 1)
        
        // diese L??sung killt den Watcher
        // entityList.value = entityList.value.filter(entity => entity.id == entityToDelete.id)

        // finde and merge all relations
        let relationsWithStartEntity = ankerPoints.value.filter(line => line.startEntity == entityToDelete.id)
        let relationsWithEndEntity = ankerPoints.value.filter(line => line.endEntity == entityToDelete.id)
        let relationsToDelete = relationsWithStartEntity.concat(relationsWithEndEntity)
        
        // delete relations
        for(const relation of relationsToDelete){
            let relationIndex = ankerPoints.value.indexOf(relation)
            ankerPoints.value.splice(relationIndex, 1)
        }

        //update Lines
        //updateLines()
    }

    const deleteLine = (lineToDelete) => {
        // aus der Array-Position der Linie l??sst sich auch der ankerpunkt bestimmen
        // damit nicht nur die linie, sondern auch die beziehung gel??scht wird, muss der Ankerpunkt gel??scht werden
        let lineIndex = lineList.value.indexOf(lineToDelete)
        ankerPoints.value.splice(lineIndex, 1)
    }

    const changeLineStyle = (line) => {
        //TODO: User Enum -> CardinalityTyp
        let lineIndex = lineList.value.indexOf(line)
        const currentStyle = ankerPoints.value[lineIndex].style

        if (currentStyle == 3) {
            ankerPoints.value[lineIndex].style = 0
        } else {
            ankerPoints.value[lineIndex].style = currentStyle + 1
        }
    }

    let triggered = false
    const handleAnkerPoint = (ankerPoint) => {
        if (!triggered) {
            triggered = true
            newAnkerPoint.value.startEntity = ankerPoint.id
            newAnkerPoint.value.startEntityPosition = ankerPoint.position
        } else if (triggered) {
            triggered = false
            newAnkerPoint.value.endEntity = ankerPoint.id
            newAnkerPoint.value.endEntityPosition = ankerPoint.position
        
        //initialize style with 0
        newAnkerPoint.value.style = 0

            ankerPoints.value.push(newAnkerPoint.value)
            newAnkerPoint.value = {}
        }
    }

    //add Element with serial ID
    const addElement = (e, typ) => {
        
        if(entityList.value.length == 0) {
            entityList.value.push({ "id": 1, "typ": typ, "text": "New Entity", "top": e.clientY-25+"px", "left": e.clientX-50+"px", "width": "100px" })
            return 
        }

        const ids = entityList.value.map(entity => {
            return entity.id
        })
        const max = Math.max(...ids)
        const nextID = max+1
        
        entityList.value.push({ "id": nextID, "typ": typ, "text": "New Entity", "top": e.clientY-25+"px", "left": e.clientX-50+"px", "width": "100px" })
    }
    
</script>

<style scoped>
.modellingContainer{
    position: absolute;
    background-color: lavender;
    left: 15%;
    top: 10%;
    width: 70%;
    height: 70%;
    padding-bottom: 10%;
}

.toolbox{
    z-index: 1;
    position: fixed;
    top: 100px;
    left: 30px;
    padding: 10px;
    width: 140px;
    height: auto;
    border-radius: 5px;
    box-shadow: 4px 4px 10px 0px rgba(15, 33, 47, 0.421);
}

.toolbox>*{
    margin: 10px;
    cursor: copy;
}

.svgMarker{
    width: 0px;
    height: 0px;
}

</style>