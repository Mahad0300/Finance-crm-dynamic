            </main>
        </div>
    </div>

    <!-- ==================== MODAL: ADD CUSTOM AGENT ==================== -->
    <div class="modal-backdrop" id="agentModal" role="dialog" aria-modal="true" aria-labelledby="agentModalTitle">
        <div class="modal-dialog modal-dialog-sm">
            <div class="modal-card">
                <div class="modal-top-header">
                    <div>
                        <h2 class="modal-heading-title" id="agentModalTitle">Add New Agent</h2>
                        <p class="modal-heading-sub" id="agentModalSubtitle">Add to persistent dropdown selections</p>
                    </div>
                    <button class="modal-close-icon" id="agentModalCloseBtn" aria-label="Close modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form id="agentForm" novalidate>
                    <div class="modal-scroll-body">
                        <div class="form-group-item">
                            <label for="agentNameInput" class="form-input-label required">Agent Full Name</label>
                            <input type="text" id="agentNameInput" class="custom-input" placeholder="e.g. John Doe" required autofocus>
                            <span class="error-text-msg" id="agentNameError"></span>
                        </div>
                    </div>

                    <div class="modal-action-footer">
                        <button type="button" class="btn-header-export" id="agentCancelBtn">Cancel</button>
                        <button type="submit" class="btn-header-add" id="agentSaveBtn">
                            <i class="fa-solid fa-plus"></i>
                            <span>Save Agent</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- ==================== MODAL: DELETE CONFIRMATION ==================== -->
    <div class="modal-backdrop" id="deleteModal" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
        <div class="modal-dialog modal-dialog-sm">
            <div class="modal-card">
                <div class="modal-top-header modal-header-danger">
                    <div>
                        <h2 class="modal-heading-title text-danger" id="deleteModalTitle">Delete Client</h2>
                        <p class="modal-heading-sub">Confirm permanent record removal</p>
                    </div>
                    <button class="modal-close-icon" id="deleteModalCloseBtn" aria-label="Close modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="modal-scroll-body">
                    <p class="delete-confirm-text">
                        Are you sure you want to delete <strong id="deleteClientName">this client</strong>?
                    </p>
                    <p class="delete-confirm-sub">
                        This will remove the record and recalculate all financial statistics.
                    </p>
                </div>

                <div class="modal-action-footer">
                    <button type="button" class="btn-header-export" id="deleteCancelBtn">Cancel</button>
                    <button type="button" class="btn-header-add btn-danger-action" id="deleteConfirmBtn">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Delete Client</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notifications Container -->
    <div class="toast-container" id="toastContainer" aria-live="polite" aria-atomic="true"></div>

    <!-- Core Scripts -->
    <script src="<?= asset('js/common.js') ?>"></script>
    <?php if (!empty($pageScript)): ?>
        <script src="<?= asset('js/' . $pageScript) ?>"></script>
    <?php endif; ?>
</body>
</html>
