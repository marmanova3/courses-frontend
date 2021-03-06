import React, { Component } from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap'
import './EnrollModal.css'
import { setUserProfile } from '../../../components/Auth'
import { axiosRequest } from '../AxiosRequests'
import { BASE_URL, USER_URL } from '../constants'
import { Redirect } from 'react-router-dom'

class EnrollModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: false,
    }

    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal,
    }))
  }

  render() {
    const { course, courseInstance, className, user } = this.props
    return (
      <div>
        <Button onClick={this.toggle} className="enroll-button">
          Enroll
        </Button>
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={className}
        >
          <ModalHeader toggle={this.toggle}>{course.name}</ModalHeader>
          <ModalBody>
            <EnrollForm courseInstance={courseInstance} user={user} />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

class EnrollForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      termsAndConditions: false,
      redirect: null,
      errors: [],
    }
  }

  requestEnrollment = () => {
    const { user, courseInstance } = this.props

    if (user) {
      const newRequests = user.requests.map(userRequestedCourse => {
        return userRequestedCourse['@id']
      })
      newRequests.push(courseInstance.fullId)

      const url = `${BASE_URL + USER_URL}/${user.id}`

      axiosRequest(
        'patch',
        JSON.stringify({
          requests: newRequests,
        }),
        url
      ).then(response => {
        if (response && response.status === 200) {
          const newRequest = { '@id': courseInstance.fullId }
          user.requests.push(newRequest)
          setUserProfile(user)
          this.setState({
            redirect: `/courses`,
          })
        } else {
          const errors = []
          errors.push(
            'There was a problem with server while sending your request. Try again later.'
          )
          this.setState({
            errors,
          })
        }
      })
    }
  }

  onSubmit = event => {
    const { termsAndConditions } = this.state

    const errors = this.validate(termsAndConditions)
    if (errors.length > 0) {
      this.setState({ errors })
      event.preventDefault()
      return
    }

    this.requestEnrollment()
    event.preventDefault()
  }

  validate = termsAndConditions => {
    const errors = []
    if (!termsAndConditions) {
      errors.push(
        'You must accept the terms and conditions to enroll in course.'
      )
    }
    return errors
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    const { termsAndConditions, redirect, errors } = this.state

    const isInvalid = termsAndConditions === false

    if (redirect) {
      return <Redirect to={redirect} />
    }

    return (
      <>
        {errors.map(error => (
          <p key={error}>Error: {error}</p>
        ))}
        <Form onSubmit={this.onSubmit} className="enroll-form-modal">
          <FormGroup check>
            <Label for="privacy">
              <Input
                name="privacy"
                id="privacy"
                onChange={this.onChange}
                type="checkbox"
              />{' '}
              I wish to use my nickname in this course.
            </Label>
          </FormGroup>
          <FormGroup check>
            <Label for="termsAndConditions">
              <Input
                name="termsAndConditions"
                id="termsAndConditions"
                onChange={this.onChange}
                type="checkbox"
              />{' '}
              I acknowledge that I have read, and do hereby accept the terms and
              conditions.
            </Label>
          </FormGroup>
          <Button
            disabled={isInvalid}
            type="submit"
            className="enroll-button-modal"
          >
            Enroll
          </Button>
        </Form>
      </>
    )
  }
}

export default EnrollModal
