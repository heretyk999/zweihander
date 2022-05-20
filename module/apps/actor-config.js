export default class ZweihanderActorConfig extends FormApplication {
  static defaultConfiguration = {
    dthAttribute: 'brawn',
    pthAttribute: 'willpower',
    intAttribute: 'perception',
    movAttribute: 'agility',
    isIgnoredPerilLadderValue: [false, false, false],
    //   "avoidStepOne": false,
    //   "avoidStepTwo": false,
    //   "avoidStepThree": false,
    //   "avoidAll": false
    // },
    encumbranceModifier: 0,
    initiativeModifier: 0,
    movementModifier: 0,
    parrySkills: [
      'Simple Melee',
      'Martial Melee',
      'Guile',
      'Charm',
      'Incantation',
    ],
    dodgeSkills: ['Coordination', 'Guile', 'Drive', 'Ride'],
    magickSkills: ['Incantation', 'Folklore'],
    isMagickUser: false,
    permanentChaosRanks: 0,
    permanentOrderRanks: 0,
    dodgeSound: 'systems/zweihander/assets/sounds/dodge.mp3',
    parrySound: 'systems/zweihander/assets/sounds/parry.mp3',
    gruntSound: 'systems/zweihander/assets/sounds/grunt_m.mp3',
    playGruntSound: true,
  };

  static getValue(actorData, key) {
    const value = getProperty(actorData.flags, `zweihander.actorConfig.${key}`);
    return value ?? this.defaultConfiguration[key];
  }

  static getConfig(actorData) {
    const cfg = {};
    for (let key in this.defaultConfiguration) {
      cfg[key] = this.getValue(actorData, key);
    }
    return cfg;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['zweihander sheet actor-config'],
      id: 'zweihander_actor_config',
      template: 'systems/zweihander/templates/app/actor-config.hbs',
      submitOnChange: true,
      submitOnClose: true,
      closeOnSubmit: false,
      width: 500,
      height: 950,
      scrollY: ['form'],
    });
  }

  /** @override */
  get title() {
    return `${this.object.name}: Actor Configuration`;
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.flags = ZweihanderActorConfig.getConfig(this.object.data);
    data.parrySkills = data.flags.parrySkills.join(', ');
    data.dodgeSkills = data.flags.dodgeSkills.join(', ');
    data.magickSkills = data.flags.magickSkills.join(', ');
    data.avoidAllPeril = data.flags.isIgnoredPerilLadderValue.reduce(
      (a, b) => a && b,
      true
    );
    return data;
  }

  /** @override */
  async _updateObject(event, formData) {
    const actor = this.object;
    const updateData = foundry.utils.expandObject(formData).flags;
    if (actor.type === 'character') {
      const sa = actor.data.data.stats.secondaryAttributes;
      const saPath = 'data.stats.secondaryAttributes';
      const actorUpdate = {};
      updateData.parrySkills = updateData.parrySkills
        .split(',')
        .map((skill) => skill.trim());
      if (!updateData.parrySkills.includes(sa.parry.associatedSkill)) {
        actorUpdate[`${saPath}.parry.associatedSkill`] =
          updateData.parrySkills[0] ?? '';
      }
      updateData.dodgeSkills = updateData.dodgeSkills
        .split(',')
        .map((skill) => skill.trim());
      if (!updateData.dodgeSkills.includes(sa.dodge.associatedSkill)) {
        actorUpdate[`${saPath}.dodge.associatedSkill`] =
          updateData.dodgeSkills[0] ?? '';
      }
      updateData.magickSkills = updateData.magickSkills
        .split(',')
        .map((skill) => skill.trim());
      if (!updateData.magickSkills.includes(sa.magick.associatedSkill)) {
        actorUpdate[`${saPath}.magick.associatedSkill`] =
          updateData.magickSkills[0] ?? '';
      }
      // wtf is this template system haha
      updateData.isIgnoredPerilLadderValue = [
        updateData.isIgnoredPerilLadderValue['[0]'],
        updateData.isIgnoredPerilLadderValue['[1]'],
        updateData.isIgnoredPerilLadderValue['[2]'],
      ];
      const avoidAllUpdate = foundry.utils.expandObject(formData).avoidAllPeril;
      const avoidAllBefore = ZweihanderActorConfig.getConfig(
        this.object.data
      ).isIgnoredPerilLadderValue.reduce((a, b) => a && b, true);
      if (avoidAllUpdate && !avoidAllBefore) {
        updateData.isIgnoredPerilLadderValue = [true, true, true];
      } else if (!avoidAllUpdate && avoidAllBefore) {
        updateData.isIgnoredPerilLadderValue = [false, false, false];
      }
      if (Object.keys(actorUpdate).length) {
        await actor.update(actorUpdate);
      }
    }
    await actor.setFlag('zweihander', 'actorConfig', updateData);
    this.render();
  }
}
