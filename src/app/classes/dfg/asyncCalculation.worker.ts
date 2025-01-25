import { CutType } from 'src/app/services/execute-cut.service';
import { EventLog } from '../event-log';
import { Activities, Activity } from './activities';
import { Arcs, DfgArc } from './arcs';
import { Dfg } from './dfg';

addEventListener('message', ({ data }: { data: DfgData }) => {
    const activities: Activities = new Activities(
        data._activities.activities.map(
            (activity) => new Activity(activity._name),
        ),
    );
    const arcs: Arcs = new Arcs(
        data._arcs.arcs.map(
            (arc) =>
                new DfgArc(
                    new Activity(arc.start._name),
                    new Activity(arc.end._name),
                ),
        ),
    );
    const eventLog: EventLog = new EventLog();
    const dfg: Dfg = new Dfg(activities, arcs, eventLog);
    const possibleCut = calculatePossibleCut(dfg);
    const response: ReturnData = {
        currentPossibleCut: possibleCut,
        arcSubsets: calculateArcSubsets(dfg, possibleCut),
    };
    postMessage(response);
});

export interface ReturnData {
    currentPossibleCut: CutType | undefined;
    arcSubsets: Array<Array<DfgArc>>;
}

interface DfgData {
    _activities: { activities: { _name: string }[] };
    _arcs: { arcs: { end: { _name: string }; start: { _name: string } }[] };
    _eventLog: any;
}

function calculatePossibleCut(dfg: Dfg): CutType | undefined {
    const allActivities: Activities = new Activities()
        .addAll(dfg.activities)
        .removePlayAndStop();

    for (let mask = 1; mask < 1 << allActivities.getLength(); mask++) {
        const a1: Activities = new Activities();
        const a2: Activities = new Activities();
        for (let i = 0; i < allActivities.getLength(); i++) {
            const activity: Activity = allActivities.getActivityByIndex(i);
            if ((mask & (1 << i)) !== 0) {
                a1.addActivity(activity);
            } else {
                a2.addActivity(activity);
            }
        }
        if (dfg.canBeCutIn(a1, a2).cutIsPossible) {
            return dfg.canBeCutIn(a1, a2).matchingCut!;
        }
    }
    return undefined;
}

function calculateArcSubsets(
    dfg: Dfg,
    possibleCut: CutType | undefined,
): Array<Array<DfgArc>> {
    if (!possibleCut) {
        return [];
    }
    return filterArcsByCutAndCallSubsetGeneration(dfg, possibleCut);
}

function filterArcsByCutAndCallSubsetGeneration(
    dfg: Dfg,
    possibleCut: CutType,
): Array<Array<DfgArc>> {
    var filteredArcs = dfg.arcs.removeArcsBy(dfg.arcs.getSelfLoopArcs());
    switch (possibleCut) {
        case CutType.ExclusiveCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getNonStartAndStopArcs(),
            );
            break;
        case CutType.SequenceCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getReverseArcs(),
            );
            break;
        case CutType.ParallelCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getNonReversedArcs(),
            );
            break;
        case CutType.LoopCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getStartAndStopArcs(),
            );
            break;
    }
    return generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
        filteredArcs.getArcs(),
        possibleCut,
        dfg,
    );
}

function generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
    arcs: Array<DfgArc>,
    matchingCut: CutType,
    dfg: Dfg,
): Array<Array<DfgArc>> {
    const subsets: Array<Array<DfgArc>> = [];

    let cutFeasibilityResults: {
        cutIsPossible: boolean;
        matchingCut: CutType | null;
        a1: Activities;
        a2: Activities;
    }[] = [];
    const totalSubsets = 1 << arcs.length;

    for (let i = 0; i < totalSubsets; i++) {
        const subset: Array<DfgArc> = [];

        for (let j = 0; j < arcs.length; j++) {
            if (i & (1 << j)) {
                subset.push(arcs[j]);
            }
        }
        cutFeasibilityResults = dfg.canBeCutBy(new Arcs(subset), matchingCut);
        if (
            cutFeasibilityResults.filter(
                (cut) =>
                    cut.cutIsPossible === true &&
                    cut.matchingCut === matchingCut,
            ).length === 1
        ) {
            subsets.push(subset);
        }
    }

    return subsets;
}
