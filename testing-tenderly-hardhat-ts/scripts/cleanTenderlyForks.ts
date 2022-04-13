import { anAxiosOnTenderly, tenderlyProjectOperation } from "../test/utils/tenderly/fork";

(async () => {
    const forks = await anAxiosOnTenderly().get(tenderlyProjectOperation("forks") + "?&perPage=1000");
    await Promise.all(
        forks.data.simulation_forks.map((fork: any) => {
            anAxiosOnTenderly().delete(tenderlyProjectOperation("fork", fork.id))
        })
    )
})()