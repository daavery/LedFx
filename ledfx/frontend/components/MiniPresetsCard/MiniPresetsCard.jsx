import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid";

import { activatePreset, getPresets } from 'frontend/actions';
import AddPresetCard from 'frontend/components/AddPresetCard/AddPresetCard';
import { mapIncludeKey } from 'frontend/utils/helpers';

const useStyles = makeStyles(theme => ({ 
  presetButton: {
    size: "large",
    margin: theme.spacing(1),
    textDecoration: "none",
    "&,&:hover": {
      color: "#000000"
    }
  },
  submitControls: {
    display: "flex",
    width: "100%"
  },
  buttonGrid: {
    direction: "row",
    justify: "flex-start",
    alignItems: "baseline",
  }
}))

const MiniPresetsCard = ({ device, presets, activatePreset, getPresets }) => {

  const classes = useStyles()
  useEffect(getPresets, [])
    
  if (!presets) {
    return <AddPresetCard></AddPresetCard>
  }

  return (
      <Card>
        <CardHeader title="Presets">
           {/*link header to presets management page*/}
        </CardHeader>
        <CardContent className={classes.submitControls}>
          {/*Buttons to activate each preset*/}
          <Grid container className={classes.buttonGrid}>
            {
              mapIncludeKey(presets).map(preset => {
                return (
                  <Grid item>
                    <Button
                      key={preset.id}
                      className={classes.presetButton}
                      onClick={() => activatePreset(preset.id)}
                    >
                      {preset.name}
                    </Button>
                  </Grid>
                );
              })
            }
          </Grid>
        </CardContent>
      </Card>
    );
}

const mapStateToProps = state => ({ 
  device: state.device,
  presets: state.presets 
})

const mapDispatchToProps = (dispatch) => ({
  activatePreset: (device, effect, presetId) => dispatch(activatePreset(device, effect, presetId)),
  getPresets: (effect) => dispatch(getPresets(effect))
})

export default connect(mapStateToProps, mapDispatchToProps)(MiniPresetsCard);