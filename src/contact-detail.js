import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {WebAPI} from './web-api';
import {ContactUpdated,ContactViewed} from './messages';
import {areEqual} from './utility';

@inject(WebAPI, EventAggregator)
export class ContactDetail {
  constructor(api, ea) {
    this.api = api;
    this.ea = ea;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    return this.api.getContactDetails(params.id).then(contact => {
      this.updateContactAndTitle(contact);
      this.ea.publish(new ContactViewed(contact));
    });
  }

  canSave() {
    return this.contact.firstName && this.contact.lastName && ! this.api.isRequesting;
  }

  save() {
    this.api.saveContact(this.contact).then(contact => {
      this.updateContactAndTitle(contact);
      this.ea.publish(new ContactUpdated(contact));
    });
  }

  updateContactAndTitle(contact) {
    this.contact = contact;
    this.routeConfig.navModel.setTitle(contact.firstName);
    this.originalContact = JSON.parse(JSON.stringify(contact));
  }

  canDeactivate() {
    if (! areEqual(this.originalContact, this.contact)) {
      let result = confirm('You have unsaved changes.  Are you sure you want to leave?');

      if (! result) {
        this.ea.publish(new ContactViewed(this.contact));
      }

      return result;
    }

    return true;
  }
}
