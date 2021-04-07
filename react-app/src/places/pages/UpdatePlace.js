import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './PlaceForm.css';

import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
} from '../../shared/utils/validator';

import { useHttp } from '../../shared/hooks/http-hook';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context';

const UpdatePlace = () => {
	const auth = useContext(AuthContext);
	const [loadedPlace, setLoadedPlace] = useState();
	const { placeId } = useParams();

	const { isLoading, errorMessage, sendRequest, clearError } = useHttp();

	const [formState, inputHandler, setFormData] = useForm(
		{
			title: {
				value: '',
				isValid: false,
			},
			description: {
				value: '',
				isValid: false,
			},
		},
		true,
	);

	useEffect(() => {
		const fetchPlace = async () => {
			const url = process.env.REACT_APP_BACKEND_URL + '/places/' + placeId;

			try {
				const responseData = await sendRequest(url);
				setLoadedPlace(responseData.place);
				setFormData(
					{
						title: {
							value: responseData.place.title,
							isValid: true,
						},
						description: {
							value: responseData.place.description,
							isValid: true,
						},
					},
					true,
				);
			} catch (error) {}
		};
		fetchPlace();
	}, [sendRequest, placeId, setFormData]);

	const history = useHistory();

	const placeUpdateSubmitHandler = async (event) => {
		event.preventDefault();
		const url = process.env.REACT_APP_BACKEND_URL + '/places/' + placeId;

		try {
			await sendRequest(
				url,
				'PATCH',
				JSON.stringify({
					title: formState.inputs.title.value,
					description: formState.inputs.description.value,
				}),
				{
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
			);
			history.push('/' + auth.userId + '/places');
		} catch (error) {}
	};

	if (isLoading) {
		return (
			<div className='center'>
				<LoadingSpinner />
			</div>
		);
	}

	if (!loadedPlace && !errorMessage)
		return (
			<div className='center'>
				<Card>
					<h2>Could find place with this ID</h2>
				</Card>
			</div>
		);

	return (
		<React.Fragment>
			<ErrorModal error={errorMessage} onClear={clearError} />
			{!isLoading && loadedPlace && (
				<form onSubmit={placeUpdateSubmitHandler} className='place-form'>
					<Input
						id='title'
						element='input'
						type='text'
						label='Title'
						validators={[VALIDATOR_REQUIRE()]}
						errorText='Please enter a valid title.'
						onInput={inputHandler}
						initialValue={loadedPlace.title}
						initialValid={true}
					/>
					<Input
						id='description'
						element='textarea'
						label='Description'
						validators={[VALIDATOR_MINLENGTH(5)]}
						errorText='Please enter a valid description (min 5 characters).'
						onInput={inputHandler}
						initialValue={loadedPlace.description}
						initialValid={true}
					/>
					<Button type='submit' disabled={!formState.isValid}>
						Update Place
					</Button>
				</form>
			)}
		</React.Fragment>
	);
};

export default UpdatePlace;
