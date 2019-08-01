import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import { Link } from 'react-router-dom';
import RSelect from 'react-select';
import uuid from 'uuid';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain';
import message from '../common/message';
import Select from '../common/Select';
import Spacer from '../common/Spacer';
import { loadConnections } from '../stores/connections';
import fetchJson from '../utilities/fetch-json.js';

function EditUserForm({ user, connections, loadConnections }) {
  const [role, setRole] = useState(user.role);
  const [passwordResetId, setPasswordResetId] = useState(user.passwordResetId);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const [userConnections, setUserConnections] = useState([]);

  const loadUserConnections = async userId => {
    const { error, userConnections } = await fetchJson(
      'GET',
      '/api/user-connections/' + userId
    );
    if (error) {
      message.error(error);
    }
    setUserConnections(userConnections);
  };

  useEffect(() => {
    loadUserConnections(user._id);
  }, [user._id]);

  const [optionDefaultValue, setOptionDefaultValue] = useState([]);

  const handleDefaultValue = () => {
    setOptionDefaultValue(userConnections);
  };

  useEffect(() => {
    handleDefaultValue();
  });

  const handleRoleChange = async event => {
    setRole(event.target.value);
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      role: event.target.value
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
  };

  const generatePasswordResetLink = async () => {
    const passwordResetId = uuid.v4();
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    setPasswordResetId(passwordResetId);
  };

  const removePasswordResetLink = async () => {
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId: ''
    });
    if (json.error) {
      return message.error('Remove reset failed: ' + json.error.toString());
    }
    setPasswordResetId(null);
  };

  const handleChangeUserConnections = async selectedItems => {
    setUserConnections(selectedItems);
    if (selectedItems === undefined || selectedItems === null) {
      const json = await fetchJson(
        'POST',
        '/api/user-connections/' + user._id,
        {}
      );
      if (json.error) {
        return message.error('Save failed: ' + json.error.toString());
      }
      return;
    }
    const json = await fetchJson('POST', '/api/user-connections/' + user._id, {
      connectionIds: selectedItems.map(item => item._id)
    });
    if (json.error) {
      return message.error('Save failed: ' + json.error.toString());
    }
  };

  const renderReset = () => {
    if (passwordResetId) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flexBasis: '50%' }}>
            <Button className="w-100" onClick={removePasswordResetLink}>
              Remove reset link
            </Button>
          </div>
          <div style={{ flexBasis: '50%', textAlign: 'center' }}>
            <Link to={`/password-reset/${passwordResetId}`}>
              Password reset link
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div>
        <Button className="w-100" onClick={generatePasswordResetLink}>
          Generate password reset link
        </Button>
      </div>
    );
  };

  return (
    <div>
      <label>
        Role
        <Select name="role" value={role} onChange={handleRoleChange}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      </label>
      <FormExplain>
        Admins can manage database connections and users
      </FormExplain>
      <Spacer size={3} />
      {renderReset()}
      <Spacer size={3} />
      <label>
        Connections
        <RSelect
          isMulti
          value={optionDefaultValue}
          options={connections}
          getOptionLabel={option => option['name']}
          getOptionValue={option => option['_id']}
          onChange={handleChangeUserConnections}
        />
      </label>
    </div>
  );
}

export default connect(
  ['connections'],
  store => ({
    loadConnections: loadConnections(store)
  })
)(EditUserForm);
