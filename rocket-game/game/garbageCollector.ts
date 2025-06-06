import {scene} from "../main";
import {challengeRows, environmentRocks} from "./objects";

export const garbageCollector = () => {
    let environmentObjectsForCollection = environmentRocks.filter(x => x.position.z > 100);
    let challengeRowsForCollection = challengeRows.filter(x => x.rowParent.position.z > 100);

    // if (environmentObjectsForCollection.length){
    for (let i = 0; i < environmentObjectsForCollection.length - 1; i++) {
        let environmentObjectIndex = environmentRocks.indexOf(environmentObjectsForCollection[i]);
        scene.remove(environmentRocks[environmentObjectIndex]);
        environmentRocks.splice(environmentObjectIndex, 1);

        // console.log(`Removing environment object at index ${i} from scene`);
    }

    for (let i = 0; i < challengeRowsForCollection.length - 1; i++) {
        // debugger;
        let challengeRowIndex = challengeRows.indexOf(challengeRowsForCollection[i]);
        scene.remove(challengeRowsForCollection[i].rowParent);
        // challengeRowsForCollection[i].rowParent.remove();
        // challengeRowsForCollection[i].rowObjects.forEach(x => {
        //     scene.remove(x);
        // });

        // console.log(`Removing challenge line at index ${i} from scene`);

        challengeRows.splice(challengeRowIndex, 1);

    }
}