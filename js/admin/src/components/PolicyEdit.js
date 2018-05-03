import app from 'flarum/app';
import icon from 'flarum/helpers/icon';
import Component from 'flarum/Component';
import Button from 'flarum/components/Button';

export default class PolicyEdit extends Component {
    init() {
        this.policy = this.props.policy;
        this.dirty = false;
        this.processing = false;
        this.toggleFields = false;

        if (this.policy === null) {
            this.initNewField();
        }
    }

    initNewField() {
        this.policy = app.store.createRecord('flagrow-terms-policies', {
            attributes: {
                name: '',
                url: '',
                update_message: '',
                terms_updated_at: '',
            },
        });
    }

    boxTitle() {
        if (this.policy.exists) {
            return this.policy.name();
        }

        return app.translator.trans('flagrow-terms.admin.buttons.new-policy');
    }

    view() {
        return m('.Mason-Box', [
            (this.policy.exists ? m('span.fa.fa-arrows.Mason-Box--handle.js-policy-handle') : null),
            m('.Button.Button--block.Mason-Box-Header', {
                onclick: () => {
                    this.toggleFields = !this.toggleFields;
                },
            }, [
                m('.Mason-Box-Header-Title', this.boxTitle()),
                m('div', [
                    (this.policy.exists ? [
                        app.translator.trans('flagrow-terms.admin.buttons.edit-policy'),
                        ' ',
                    ] : null),
                    icon(this.toggleFields ? 'chevron-up' : 'chevron-down'),
                ]),
            ]),
            (this.toggleFields ? this.viewFields() : null),
        ]);
    }

    viewFields() {
        return m('form', [
            m('.Mason-Box--row', [
                m('.Mason-Box--column', [
                    m('h4', 'Field settings'),
                    m('.Form-group', [
                        m('label', app.translator.trans('flagrow-terms.admin.policies.name')),
                        m('input.FormControl', {
                            type: 'text',
                            value: this.policy.name(),
                            oninput: m.withAttr('value', this.updateAttribute.bind(this, 'name')),
                        }),
                        m('.helpText', app.translator.trans('flagrow-terms.admin.policies.name-help')),
                    ]),
                    m('.Form-group', [
                        m('label', app.translator.trans('flagrow-terms.admin.policies.url')),
                        m('input.FormControl', {
                            type: 'url',
                            value: this.policy.url(),
                            oninput: m.withAttr('value', this.updateAttribute.bind(this, 'url')),
                        }),
                        m('.helpText', app.translator.trans('flagrow-terms.admin.policies.description-help')),
                    ]),
                    m('.Form-group', [
                        m('label', app.translator.trans('flagrow-terms.admin.policies.update_message')),
                        m('textarea.FormControl', {
                            value: this.policy.update_message(),
                            oninput: m.withAttr('value', this.updateAttribute.bind(this, 'update_message')),
                        }),
                        m('.helpText', app.translator.trans('flagrow-terms.admin.policies.description-help')),
                    ]),
                    m('.Form-group', [
                        m('label', app.translator.trans('flagrow-terms.admin.policies.terms_updated_at')),
                        m('input.FormControl', {
                            type: 'text',
                            value: this.policy.terms_updated_at(),
                            oninput: m.withAttr('value', this.updateAttribute.bind(this, 'terms_updated_at')),
                        }),
                        m('.helpText', app.translator.trans('flagrow-terms.admin.policies.description-help')),
                    ]),
                ]),
            ]),
            m('li.ButtonGroup', [
                Button.component({
                    type: 'submit',
                    className: 'Button Button--primary',
                    children: app.translator.trans('flagrow-terms.admin.buttons.' + (this.policy.exists ? 'save' : 'add') + '-policy'),
                    loading: this.processing,
                    disabled: !this.readyToSave(),
                    onclick: this.savePolicy.bind(this),
                }),
                (this.policy.exists ? Button.component({
                    type: 'submit',
                    className: 'Button Button--danger',
                    children: app.translator.trans('flagrow-terms.admin.buttons.delete-policy'),
                    loading: this.processing,
                    onclick: this.deletePolicy.bind(this),
                }) : ''),
            ]),
        ]);
    }

    updateAttribute(attribute, value) {
        this.policy.pushAttributes({
            [attribute]: value,
        });

        this.dirty = true;
    }

    readyToSave() {
        return this.dirty;
    }

    savePolicy() {
        this.processing = true;

        const createNewRecord = !this.policy.exists;

        this.policy.save(this.policy.data.attributes).then(() => {
            if (createNewRecord) {
                this.initNewField();
                this.toggleFields = false;
            }

            this.processing = false;
            this.dirty = false;

            m.redraw();
        }).catch(err => {
            this.processing = false;

            throw err;
        });
    }

    deletePolicy() {
        if (!confirm(app.translator.trans('flagrow-terms.admin.messages.delete-policy-confirmation', {
                name: this.policy.name(),
            }))) {
            return;
        }

        this.processing = true;

        this.policy.delete().then(() => {
            this.processing = false;

            m.redraw();
        }).catch(err => {
            this.processing = false;

            throw err;
        });
    }
}