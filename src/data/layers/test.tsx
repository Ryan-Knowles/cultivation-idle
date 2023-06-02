/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import Decimal, { format, formatSmall, formatTime } from "util/bignum";
import { render } from "util/vue";
import { createLayerTreeNode, createResetButton } from "../common";
import { createUpgrade } from "features/upgrades/upgrade";
import { createCostRequirement } from "game/requirements";
import { noPersist } from "game/persistence";
import { createSequentialModifier, createMultiplicativeModifier } from "game/modifiers";

const id = "test_layer";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Prestige";
    const color = "#4BDC13";
    const points = createResource<DecimalSource>(0, "prestige points");

    this.on("update", diff => {
        points.value = Decimal.add(points.value, Decimal.times(myModifier.apply(1), diff));
    });

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        reset
    }));

    const myUpgrade = createUpgrade(() => ({
        requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: 10
        })),
        display: {
            description: "Double points generation"
        }
    }));

    const myModifier = createSequentialModifier(() => [
        createMultiplicativeModifier(() => ({
            multiplier: 2,
            enabled: myUpgrade.bought
        }))
    ]);

    return {
        name,
        color,
        points,
        myUpgrade,
        display: jsx(() => (
            <>
                <MainDisplay resource={points} color={color} />
                {render(myUpgrade)}
            </>
        )),
        treeNode
    };
});

export default layer;
