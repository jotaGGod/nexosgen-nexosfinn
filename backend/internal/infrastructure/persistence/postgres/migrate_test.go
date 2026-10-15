package postgres

import (
	"errors"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeMigrationRunner struct {
	version     uint
	dirty       bool
	versionErr  error
	forceErr    error
	upErr       error
	forcedTo    int
	forceCalled bool
	upCalled    bool
}

func (f *fakeMigrationRunner) Version() (uint, bool, error) {
	return f.version, f.dirty, f.versionErr
}

func (f *fakeMigrationRunner) Force(version int) error {
	f.forceCalled = true
	f.forcedTo = version
	return f.forceErr
}

func (f *fakeMigrationRunner) Up() error {
	f.upCalled = true
	return f.upErr
}

func TestMigrateUpRecoversDirtyVersionSixAndReappliesIt(t *testing.T) {
	runner := &fakeMigrationRunner{version: 6, dirty: true}

	require.NoError(t, migrateUp(runner))
	assert.True(t, runner.forceCalled)
	assert.Equal(t, 5, runner.forcedTo)
	assert.True(t, runner.upCalled)
}

func TestMigrateUpDoesNotForceUnknownDirtyVersion(t *testing.T) {
	runner := &fakeMigrationRunner{version: 7, dirty: true}

	err := migrateUp(runner)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "recuperacao manual necessaria")
	assert.False(t, runner.forceCalled)
	assert.False(t, runner.upCalled)
}

func TestMigrateUpAcceptsFreshDatabaseAndNoChange(t *testing.T) {
	runner := &fakeMigrationRunner{versionErr: migrate.ErrNilVersion, upErr: migrate.ErrNoChange}

	require.NoError(t, migrateUp(runner))
	assert.False(t, runner.forceCalled)
	assert.True(t, runner.upCalled)
}

func TestMigrateUpReturnsForceErrorWithoutRunningUp(t *testing.T) {
	runner := &fakeMigrationRunner{version: 6, dirty: true, forceErr: errors.New("force failed")}

	err := migrateUp(runner)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "force failed")
	assert.False(t, runner.upCalled)
}

func TestLatestEmbeddedVersionTracksMigrationFiles(t *testing.T) {
	version, err := latestEmbeddedVersion()

	require.NoError(t, err)
	assert.Equal(t, uint(11), version)
}
