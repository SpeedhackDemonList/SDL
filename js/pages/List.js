import { store } from '../main.js';
import { embed } from '../util.js';
import { score } from '../score.js';
import { fetchEditors, fetchList, fetchListNames } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    helper: 'user-shield',
    dev: 'code',
    trial: 'user-lock',
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </div>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>75%</strong> or better to qualify</p>
                    <p v-else-if="selected + 1 <= 150"><strong>100%</strong> required to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`./assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Original List by <a href="https://tsl.pages.dev/" target="_blank">The Shitty List</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`./assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                     <p>
                        The level must be a rated demon to be part of the list.
                    </p>
                    <p>
                        Achieved the record without using hacks (however, Click Between Frames is allowed. Physics bypass is banned.)
                    </p>
                    
                    <p v-if="acropolisIndex !== null">
                         DOWNLOADABLE raw footage must be given when submitting a level harder than Windy Landscape 1.75x (#{{ acropolisIndex + 1 }}). Any level deemed harder without raw will be rejected.
                        </p>
                        <p v-else>
                            DOWNLOADABLE raw footage must be given when submitting a level harder than                          Windy Landscape 1.75x (position unknown). Any level deemed harder without raw will be rejected. An unedited and public live stream with chat enabled is acceptable as raw footage.
                    </p>

                    <p>
                        Achieved the record on the level that is listed on the site - please check the level ID before you submit a record
                    </p>
                    <p>
                        Have either source audio or AUDIBLE clicks/taps in the video. Edited audio only does not count and the submission will be denied. 
                    </p>
                    <p>
                        2 players level must be done solo and with handcam as proof.
                    </p>
                    <p>
                        The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this
                    </p>
                    <p>
                        The recording must also show the player hitting the endwall and the level complete screen, or else the completion will be invalidated.
                    </p>
                    <p>
                        The speed you are playing at must remain the same during the course of the completion.
                    </p>
                    <p>
                        Do not use secret routes or bug routes.
                    </p>
                    <p>
                        The minimum speed to place on the list is 1.25x. The fastest completion of a level is the only instance that will be on the list. For a new instance to replace it, it must be at least 5% faster. A 125% speed completion would need a 130% completion at minimum for example. If a record is at 150% or higher, it must be 10% faster. A 200% speed completion would need a 210% completion at minimum for example.
                    </p>
                    <p>
                        Cheat indicator is highly encouraged. We know certain mod interface can put the dot red because of speedhack. If it is red (or absent), you MUST show all your hacks after your completion.
                    </p>
                     <p>
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
         list: [],
         editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        acropolisIndex: null,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();
        
        try {
          // Fetch the raw list to find Acropolis index
          const rawList = await fetchListNames();

          if (rawList) {
              const acroIndex = rawList.findIndex(
                  name => name.toLowerCase() === 'windy'
              );
              this.acropolisIndex = acroIndex !== -1 ? acroIndex : null;
          } else {
              this.acropolisIndex = null;
          }
        } catch (e) {
          console.error('Failed to fetch _list.json:', e);
          this.acropolisIndex = null;
        }


        // Error handling
        if (!this.list) {
            this.errors = [
                'Failed to load list. Retry in a few minutes or notify list staff.',
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    }),
            );
            if (!this.editors) {
                this.errors.push('Failed to load list editors.');
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
